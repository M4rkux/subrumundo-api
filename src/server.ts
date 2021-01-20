import app from './app';

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Subrumundo API is listening on port ${port}`);
});