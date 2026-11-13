/**
 * ==========================================================================
 * EMAILJS CONFIG — delivers the Pokédex contact form to your Gmail inbox
 * ==========================================================================
 *
 * 1. Create a free account at https://www.emailjs.com/
 *
 * 2. Email Services → Add New Service → Gmail
 *    Connect mohammedafhaam15@gmail.com, then copy the "Service ID".
 *
 * 3. Email Templates → Create New Template
 *    • "To email"  : mohammedafhaam15@gmail.com
 *    • "Reply To"  : {{reply_to}}
 *    • "Subject"   : Portfolio message from {{from_name}}
 *    • "Content"   : Name: {{from_name}}
 *                    Contact: {{contact}}
 *                    Sent: {{sent_at}}
 *
 *                    {{message}}
 *    Copy the "Template ID".
 *
 * 4. Account → General → copy the "Public Key".
 *
 * Paste all three values below. Until they are filled in, the Send button
 * falls back to opening the visitor's email app with the message already
 * addressed and filled in for mohammedafhaam15@gmail.com.
 * ==========================================================================
 */
window.EMAILJS_CONFIG = {
    publicKey: '',   // e.g. 'AbCdEfGhIjKlMnOp'
    serviceId: '',   // e.g. 'service_abc1234'
    templateId: '',  // e.g. 'template_xyz9876'
    toEmail: 'mohammedafhaam15@gmail.com'
};
