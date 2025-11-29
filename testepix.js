const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-7033004529241807-070413-0bf80b3feb9d386af77c9518742a4b6a-2365608434',
});

async function gerarPagamentoPix() {
  try {
    const payment = new Payment(client);
    const pagamento = await payment.create({
      body: {
        transaction_amount: 5.00,
        description: 'API Key para uso do Genos Bot',
        payment_method_id: 'pix',
        payer: {
          email: 'banidobiel@gmail.com',
          first_name: 'Veuvania Cordeiro',
          last_name: 'Lins',
          identification: {
            type: 'CPF',
            number: '27521929837',
          },
        },
      },
    });

    // 🔍 Mostrar objeto completo
    console.log('📦 Objeto pagamento:\n', pagamento);

    const dados = pagamento.body;
    if (!dados) {
      console.error('❌ pagamento.body está undefined. Provavelmente erro no request.');
      return;
    }

    const txData = dados.point_of_interaction?.transaction_data;

    console.log('🧾 Resposta completa:\n', JSON.stringify(dados, null, 2));

    if (!txData?.qr_code || !txData?.qr_code_base64) {
      console.error('\n❌ QR Code Pix não disponível. Verifique se a conta está habilitada para gerar cobranças Pix.');
      return;
    }

    console.log('\n✅ Pagamento gerado com sucesso!');
    console.log('🆔 ID do pagamento:', dados.id);
    console.log('📄 Código Pix:\n', txData.qr_code);
    console.log('\n🖼️ QR Code Base64:\n', txData.qr_code_base64);

  } catch (error) {
    console.error('\n🔥 Erro ao gerar pagamento:');
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
  }
}

gerarPagamentoPix();
