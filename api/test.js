// api/test.js
export default async (req, res) => {
  console.log('✅ TEST Function was called!', req.method);
  return res.status(200).send('TEST OK');
};
