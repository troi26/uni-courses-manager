const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // if there isn't any token
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.user = user;
      next(); // pass the execution off to whatever request the client intended
    });
}

module.exports = authenticateToken;

// module.exports = {
//     validateToken: (req, res, next) => {
//       const authorizationHeaader = req.headers.authorization;
//       let result;
//       if (authorizationHeaader) {
//         const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
//         const options = {
//           expiresIn: '2d',
//           issuer: 'https://scotch.io'
//         };
//         try {
//           // verify makes sure that the token hasn't expired and has been issued by us
//           result = jwt.verify(token, process.env.JWT_SECRET, options);
  
//           // Let's pass back the decoded token to the request object
//           req.decoded = result;
//           // We call next to pass execution to the subsequent middleware
//           next();
//         } catch (err) {
//           // Throw an error just in case anything goes wrong with verification
//           throw new Error(err);
//         }
//       } else {
//         result = { 
//           error: `Authentication error. Token required.`,
//           status: 401
//         };
//         res.status(401).send(result);
//       }
//     }
//   };