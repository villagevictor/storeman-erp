import emailjs from '@emailjs/browser';
import { EmailJSConfig } from '../types';

const STORAGE_KEY_EMAILJS = 'erp_emailjs_config';

export function getStoredEmailJSConfig(): EmailJSConfig {
  const envServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  const envTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  const envPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
  const envAdminEmail = import.meta.env.VITE_ADMIN_ALERT_EMAIL || 'ashenafihailay645@gmail.com';

  const stored = localStorage.getItem(STORAGE_KEY_EMAILJS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        serviceId: parsed.serviceId || envServiceId,
        templateId: parsed.templateId || envTemplateId,
        publicKey: parsed.publicKey || envPublicKey,
        adminEmail: parsed.adminEmail || envAdminEmail,
      };
    } catch {
      // fallback
    }
  }

  return {
    serviceId: envServiceId,
    templateId: envTemplateId,
    publicKey: envPublicKey,
    adminEmail: envAdminEmail,
  };
}

export function saveEmailJSConfig(config: EmailJSConfig): void {
  localStorage.setItem(STORAGE_KEY_EMAILJS, JSON.stringify(config));
}

export interface EmailDispatchResult {
  success: boolean;
  simulated: boolean;
  message: string;
}

/**
 * Dispatch Low Stock Alert email to Admin
 */
export async function sendLowStockAlertEmail(params: {
  materialName: string;
  sku: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  warehouseName: string;
  triggeredBy?: string;
  recipientEmail?: string;
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
}): Promise<EmailDispatchResult> {
  const config = getStoredEmailJSConfig();
  const effectiveRecipient = params.recipientEmail || config.adminEmail;
  const effectiveServiceId = params.serviceId || config.serviceId;
  const effectiveTemplateId = params.templateId || config.templateId;
  const effectivePublicKey = params.publicKey || config.publicKey;

  const templateParams = {
    to_email: effectiveRecipient,
    subject: `🚨 [CRITICAL ERP ALERT] Low Stock: ${params.materialName} (${params.sku})`,
    material_name: params.materialName,
    sku: params.sku,
    current_stock: `${params.currentStock} ${params.unit}`,
    min_threshold: `${params.minThreshold} ${params.unit}`,
    warehouse_name: params.warehouseName,
    triggered_by: params.triggeredBy || 'ERP Inventory System',
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' }) + ' (EAT)',
    message: `Material ${params.materialName} (${params.sku}) has reached or fallen below its safety threshold (${params.currentStock} remaining vs. ${params.minThreshold} minimum) at warehouse "${params.warehouseName}". Please initiate replenishment immediately.`,
  };

  // If real keys are provided, call EmailJS SDK
  if (effectiveServiceId && effectiveTemplateId && effectivePublicKey) {
    try {
      await emailjs.send(
        effectiveServiceId,
        effectiveTemplateId,
        templateParams,
        effectivePublicKey
      );
      return {
        success: true,
        simulated: false,
        message: `Alert successfully dispatched via EmailJS to ${effectiveRecipient}`,
      };
    } catch (err: any) {
      console.warn('EmailJS delivery error, falling back to simulated dispatch:', err);
      return {
        success: true,
        simulated: true,
        message: `EmailJS response (${err?.text || err?.message || 'Check keys'}). Fallback simulated alert recorded.`,
      };
    }
  }

  // Simulated fallback
  console.info('Simulated Low Stock Email Dispatched:', templateParams);
  return {
    success: true,
    simulated: true,
    message: `[Simulated Mode] Low stock alert queued for ${config.adminEmail}. Configure EmailJS keys in Settings for live SMTP delivery.`,
  };
}

/**
 * Dispatch New User Sign Up Notification email to Admin
 */
export async function sendNewUserAlertEmail(params: {
  applicantName: string;
  applicantEmail: string;
  assignedRole: string;
}): Promise<EmailDispatchResult> {
  const config = getStoredEmailJSConfig();

  const templateParams = {
    to_email: config.adminEmail,
    subject: `🔔 [NEW ERP REGISTRATION] Pending Approval: ${params.applicantName}`,
    applicant_name: params.applicantName,
    applicant_email: params.applicantEmail,
    requested_role: params.assignedRole,
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' }) + ' (EAT)',
    message: `A new user (${params.applicantName}, ${params.applicantEmail}) has registered on Enterprise ERP and is currently in 'pending' status awaiting Administrator authorization.`,
  };

  if (config.serviceId && config.templateId && config.publicKey) {
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );
      return {
        success: true,
        simulated: false,
        message: `New user registration notification sent via EmailJS to ${config.adminEmail}`,
      };
    } catch (err: any) {
      console.warn('EmailJS delivery error:', err);
      return {
        success: true,
        simulated: true,
        message: `EmailJS dispatch failed (${err?.text || 'Check keys'}). Simulated alert logged.`,
      };
    }
  }

  return {
    success: true,
    simulated: true,
    message: `[Simulated Mode] New user alert dispatched for ${params.applicantName} to ${config.adminEmail}`,
  };
}
