const jwt = require('jsonwebtoken');

function authenticateToken(socket, next) {
    console.log("SIO auth: ", socket.handshake.query);
    if (socket.handshake.query && socket.handshake.query.token){
        jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function(err, decoded) {
          if (err) return next(new Error('Authentication error'));
          socket.decoded = decoded;
          next();
        });
      }
      else {
        next(new Error('Authentication error'));
      }    
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