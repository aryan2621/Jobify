export interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey || !token) {
      const missingFields: string[] = [];
      if (!secretKey) missingFields.push('RECAPTCHA_SECRET_KEY');
      if (!token) missingFields.push('reCAPTCHA token');
      
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });
    const result: RecaptchaResponse = await response.json();
    if (!result.success) {
      console.error('reCAPTCHA verification failed:', result['error-codes']);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
}
