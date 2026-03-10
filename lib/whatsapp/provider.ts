import axios from 'axios';

interface TemplateVariable {
  type: 'text';
  text: string;
}

interface SendTemplateParams {
  to: string;
  templateName: string;
  languageCode: string;
  bodyVariables: TemplateVariable[];
  headerText?: string;
  headerMediaUrl?: string;
  headerMediaType?: 'image' | 'video';
}

interface SendResult {
  messageId: string;
  status: string;
}

export class WhatsAppProvider {
  private baseUrl = 'https://graph.facebook.com/v21.0';
  private phoneId: string;
  private token: string;

  constructor(phoneId: string, token: string) {
    this.phoneId = phoneId;
    this.token = token;
  }

  private normalizePhone(phone: string): string {
    // Remove tudo que não for dígito
    const digits = phone.replace(/\D/g, '');
    // Adiciona código do Brasil se não tiver DDI
    if (digits.length <= 11) return `55${digits}`;
    return digits;
  }

  async sendTemplate(params: SendTemplateParams): Promise<SendResult> {
    const { templateName, languageCode, bodyVariables, headerText, headerMediaUrl, headerMediaType } = params;
    const to = this.normalizePhone(params.to);

    const components: any[] = [
      {
        type: 'body',
        parameters: bodyVariables,
      },
    ];

    if (headerText) {
      components.unshift({
        type: 'header',
        parameters: [{ type: 'text', text: headerText }],
      });
    } else if (headerMediaUrl && headerMediaType) {
      components.unshift({
        type: 'header',
        parameters: [
          {
            type: headerMediaType,
            [headerMediaType]: { link: headerMediaUrl },
          },
        ],
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        messageId: response.data.messages[0].id,
        status: 'sent',
      };
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.error('[WhatsApp] Erro ao enviar:', errorMsg);
      throw new Error(`WhatsApp API Error: ${errorMsg}`);
    }
  }
}

// Singleton para a clínica default (env vars)
export function getDefaultProvider(): WhatsAppProvider {
  return new WhatsAppProvider(
    process.env.WHATSAPP_PHONE_ID!,
    process.env.WHATSAPP_TOKEN!
  );
}
