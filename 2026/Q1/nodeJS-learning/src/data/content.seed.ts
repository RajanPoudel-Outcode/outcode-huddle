import { IContentPage } from '@/features/content/types/content.types';

/**
 * Seed content pages (Terms & Conditions, Privacy Policy). Bodies are plain
 * text with paragraph breaks; edit via the admin content API later.
 */
export const contentSeed: IContentPage[] = [
  {
    type: 'terms',
    title: 'Terms & Conditions',
    body: [
      'Welcome to our store. By accessing or using this application you agree to be bound by these Terms & Conditions. Please read them carefully before placing an order.',
      '1. Use of the Service. You agree to use the application only for lawful purposes and in a way that does not infringe the rights of, or restrict the use of, this service by any third party.',
      '2. Orders & Pricing. All orders are subject to acceptance and availability. Prices are shown in the applicable currency and may change without notice prior to order confirmation.',
      '3. Accounts. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
      '4. Limitation of Liability. The service is provided on an "as is" basis. To the maximum extent permitted by law we are not liable for any indirect or consequential loss arising from your use of the application.',
      '5. Changes. We may update these terms from time to time. Continued use of the service after changes are posted constitutes acceptance of the revised terms.'
    ].join('\n\n')
  },
  {
    type: 'privacy',
    title: 'Privacy Policy',
    body: [
      'This Privacy Policy explains how we collect, use, and protect your personal information when you use our application.',
      '1. Information We Collect. We collect information you provide directly, such as your name, email address, and shipping details, as well as data generated through your use of the service.',
      '2. How We Use Information. We use your information to process orders, provide customer support, improve our service, and communicate important updates.',
      '3. Sharing. We do not sell your personal information. We share data only with service providers who help us operate the application, and only as needed to provide our services.',
      '4. Data Security. We apply reasonable technical and organizational measures to protect your information against unauthorized access, loss, or misuse.',
      '5. Your Rights. You may request access to, correction of, or deletion of your personal information by contacting our support team.'
    ].join('\n\n')
  }
];
