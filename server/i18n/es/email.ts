export const email = {
  signUpEmailTemplate: {
    subject: 'Verifica tu correo electrónico',
    preview: 'Verificación de correo electrónico de {websiteName}',
    heading: 'Verifica tu dirección de correo electrónico',
    mainText:
      'Gracias por iniciar el proceso de creación de una nueva cuenta en {websiteName}. Queremos asegurarnos de que realmente eres tú. Por favor, introduce el siguiente código de verificación cuando se te solicite. Si no deseas crear una cuenta, puedes ignorar este mensaje.',
    verifyText: 'Código de verificación',
    validityText: '(Este código es válido durante 10 minutos)',
    cautionText:
      '{websiteName} nunca te enviará un correo electrónico solicitando que reveles o verifiques tu contraseña, tarjeta de crédito o número de cuenta bancaria.',
    footerText:
      'Este mensaje fue producido y distribuido por {websiteName}, Inc., 410 Terry Ave. North, Seattle, WA 98109. © 2022, {websiteName}, Inc. Todos los derechos reservados. {websiteName} es una marca registrada de {websiteName}, Inc. Ver nuestra política de privacidad.',
    logoAlt: 'Logo de {websiteName}',
  },
} as const;
