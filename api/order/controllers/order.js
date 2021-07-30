'use strict';

/**
 * Order.js controller
 *
 * @description: A set of functions called "actions" for managing `Order`.
 */
// const stripeConfig =require('../../../lib/stripe');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const {parseMultipartData, sanitizeEntity} = require('strapi-utils');

module.exports = {
  /**
   * Create a/an order record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    const validatedCart = [];
    const receiptCart = [];
    let validatedTotal = 100; // why initially 100?


    // TODO: put totals here. be sure they match the cart totals

    const {
      firstName,
      lastName,
      address1,
      address2,
      city,
      region,
      zipCode,
      country,
      total,
      cartContents,
      email,
      token,
    } = JSON.parse(ctx.request.body);

    console.log(JSON.parse(ctx.request.body));

    await Promise.all(cartContents.map(async (product) => {
      const validatedProduct = await strapi.services.product.findOne({
        id: product.id,
      });

      console.log('validatedProduct', validatedProduct);

      if (validatedProduct) {
        validatedProduct.quantity = product.quantity;

        validatedCart.push(validatedProduct);

        receiptCart.push({
          id: validatedProduct.id,
          name: validatedProduct.title,
          quantity: validatedProduct.quantity,
        });
      }

      // return validatedProduct
    }));

    console.log('validatedCart', validatedCart);

    validatedTotal = validatedCart.reduce((counter, product) => counter + product.price * product.quantity, 0);

    console.log('validatedTotal', validatedTotal);

    const metadata = {};
    receiptCart.map((product) => (
      metadata[product.name] = product.quantity
    ));

    console.log('metadata', metadata);

    const stripeAmount = Math.floor(validatedTotal * 100);

    // TODO: CALCULATE SHIPPING INBETWEEN STEPS (MAY NEED A SEPARATE ORDER CONTROLLER/ROUTE)

    let chargeResponse;

    try {
      const charge = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: 'INR',
        confirm: true,
        payment_method: token,
        metadata,
        receipt_email: 'matthewsamuelthomas@gmail.com',
        shipping: {
          name: firstName + ' ' + lastName,
          address: {
            line1: address1,
            line2: address2,
            postal_code: zipCode,
            state: region,
            country,
          },
        },
      });

      chargeResponse = charge;
    } catch (err) {
      return {
        error: {
          message: err.raw.message,
          statusCode: err.raw.statusCode,
          docUrl: err.raw.doc_url,
          err: err,
        },
      };
    }


    const stripe_order_id = chargeResponse.id;
    const stripe_url = `https://dashboard.stripe.com/test/payments/${stripe_order_id}`; // TODO: customize to satyn

    const entry = {
      email: 'testemail@testemail.com',
      firstName,
      lastName,
      address1,
      address2,
      city,
      region,
      zipCode,
      country,
      total: validatedTotal,
      cartContents: receiptCart,
      stripe_charge_id: token,
      stripe_order_id,
      stripe_url,
    };

    const entity = await strapi.services.order.create(entry);

    return sanitizeEntity(entity, {model: strapi.models.order});
  },
};
