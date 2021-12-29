import express from 'express';
import { Kafka, logLevel } from 'kafkajs';

import routes from './routes';

const app = express();
const PORT = 3000;

app.use(express.json());

// Faz conexão com kafka
const kafka = new Kafka({
  clientId: 'api',
  brokers: ['localhost:9092'],
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 10
  },
});
 
const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'beneficiary-group-receiver' })

// Disponibiliza o producer para todas rotas
app.use((req, res, next) => {
  req.producer = producer;

  return next();
})

// Cadastra as rotas da aplicação
app.use(routes);


async function run() {
  await producer.connect()
  await consumer.connect()

  await consumer.subscribe({ topic: 'beneficiary-response' });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Resposta', String(message.value));
    },
  });

  app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
  });
}

run().catch(console.error)

