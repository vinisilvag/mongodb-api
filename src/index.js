import express from 'express';
import bodyParser from 'body-parser';
import { Portfolio, Auth } from '@/app/controllers';

const app = express();
const port = 3333;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/portfolio', Portfolio);
app.use('/auth', Auth);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
