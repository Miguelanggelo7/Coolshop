import Commerce from '@chec/commerce.js';

let commerce = null;

const getCommerce = (commercePublicKey) => {
  if (commerce) {
    return commerce;
  }
  const publicKey = commercePublicKey || process.env.COMMERCE_PUBLIC_KEY;
  const devEnvironment = process.env.NODE_ENV === 'development';

  if (devEnvironment && !publicKey) {
    throw Error('Commerce public API Key not found');
  }

  commerce = new Commerce(publicKey, devEnvironment);
  return commerce;
};

export default getCommerce;
