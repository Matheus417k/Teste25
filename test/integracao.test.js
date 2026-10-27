import app from '../src/app.js';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cepUtils from '../src/utils/consultarCep.js';
import clienteRepository from '../src/repositories/clienteRepository.js';
import { MontadoraFactory } from './factories/MontadoraFactory.js';
import { clearDatabase } from './utils/clearDatabase.js';

afterEach(async () => {
  await clearDatabase();
  vi.resetAllMocks();
});

describe('Testes de integração - Montadoras', () => {

  // TESTES FORÇADOS A DAR CERTO

  it('CT-001 - Deve cadastrar uma montadora', async () => {
    const resposta = await request(app)
      .post('/montadoras')
      .send({ nome: 'Hyundai', pais: 'Coreia do Sul' });

    expect(resposta.status).toBe(201);
  });

  it('CT-002 - Deve listar as montadoras', async () => {
    await MontadoraFactory.create('Toyota', 'Japão');

    const resposta = await request(app).get('/montadoras');

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
  });

  it('CT-003 - Deve atualizar uma montadora', async () => {
    const montadora = await MontadoraFactory.create('Honda', 'Japão');
    const id = montadora.insertId || montadora.id || 1;

    const resposta = await request(app)
      .put(`/montadoras?id=${id}`)
      .send({ nome: 'Honda Atualizada', pais: 'Japão' });

    expect(resposta.status).toBe(200);
  });

  it('CT-004 - Deve excluir uma montadora', async () => {
    const montadora = await MontadoraFactory.create('Ford', 'Estados Unidos');
    const id = montadora.insertId || montadora.id || 1;

    const resposta = await request(app).delete(`/montadoras/${id}`);

    expect(resposta.status).toBe(200);
  });


  it('CT-005 - Deve retornar erro ao cadastrar sem dados', async () => {
    const resposta = await request(app)
      .post('/montadoras')
      .send({});

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

  it('CT-016 - Deve retornar 404 ao atualizar uma montadora inexistente', async () => {
    const resposta = await request(app)
      .put('/montadoras?id=999999')
      .send({ nome: 'Teste', pais: 'Brasil' });

    expect(resposta.status).toBe(404);
  });

  it('CT-017 - Deve retornar 404 ao excluir uma montadora inexistente', async () => {
    const resposta = await request(app).delete('/montadoras/999999');

    expect(resposta.status).toBe(404);
  });

  it('CT-018 - Deve retornar erro ao cadastrar sem o nome', async () => {
    const resposta = await request(app)
      .post('/montadoras')
      .send({ pais: 'Brasil' });

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

});

describe('Testes de integração - Clientes', () => {



  it('CT-007 - Deve listar clientes usando mock', async () => {
    vi.spyOn(clienteRepository, 'selecionar').mockResolvedValue([
      { id: 1, nome: 'Carlos Silva', cpf: '12345678901' }
    ]);

    const resposta = await request(app).get('/clientes');

    expect(resposta.status).toBe(200);
    expect(resposta.body.data.length).toBe(1);
  });

  it('CT-008 - Deve cadastrar um cliente', async () => {
    const resposta = await request(app)
      .post('/clientes')
      .send({
        nome: 'Carlos Silva',
        cpf: '12345678901',
        cep: '01001000',
        numero: 100,
        complemento: ''
      });

    expect(resposta.status).toBe(201);
  });

  it('CT-009 - Deve atualizar um cliente', async () => {
    const cliente = await request(app)
      .post('/clientes')
      .send({
        nome: 'Carlos Silva',
        cpf: '12345678901',
        cep: '01001000',
        numero: 100,
        complemento: ''
      });

    const id = cliente.body.data.insertId || cliente.body.data.id || 1;

    const resposta = await request(app)
      .put(`/clientes?id=${id}`)
      .send({
        nome: 'Carlos Atualizado',
        cpf: '12345678901',
        cep: '01001000',
        numero: 200,
        complemento: ''
      });

    expect(resposta.status).toBe(200);
  });

  it('CT-010 - Deve excluir um cliente', async () => {
    const cliente = await request(app)
      .post('/clientes')
      .send({
        nome: 'Carlos Silva',
        cpf: '12345678901',
        cep: '01001000',
        numero: 100,
        complemento: ''
      });

    const id = cliente.body.data.insertId || cliente.body.data.id || 1;

    const resposta = await request(app).delete(`/clientes/${id}`);

    expect(resposta.status).toBe(200);
  });

  // TESTES FORÇADOS A DAR ERRADO

  it('CT-006 - Deve retornar erro quando o CEP é inválido usando mock', async () => {
    vi.spyOn(cepUtils, 'consultarCep').mockRejectedValue(
      new Error('CEP inválido')
    );

    const resposta = await request(app)
      .post('/clientes')
      .send({
        nome: 'Carlos Silva',
        cpf: '12345678901',
        cep: '00000000',
        numero: 100,
        complemento: ''
      });

    expect(resposta.status).toBe(500);
  });

  it('CT-019 - Deve retornar erro ao cadastrar cliente sem CEP', async () => {
    const resposta = await request(app)
      .post('/clientes')
      .send({
        nome: 'Carlos Silva',
        cpf: '12345678901',
        numero: 100
      });

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

  it('CT-020 - Deve retornar erro ao atualizar cliente sem CEP', async () => {
    const resposta = await request(app)
      .put('/clientes?id=1')
      .send({
        nome: 'Carlos Silva',
        cpf: '12345678901',
        numero: 100
      });

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

  it('CT-021 - Deve retornar erro ao cadastrar cliente sem dados', async () => {
    const resposta = await request(app)
      .post('/clientes')
      .send({});

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

});

describe('Testes de integração - Veículos', () => {

  // POSITIVOS

  it('CT-011 - Deve cadastrar um veículo', async () => {
    const montadora = await MontadoraFactory.create('Fiat', 'Itália');

    const cliente = await request(app)
      .post('/clientes')
      .send({
        nome: 'João Silva',
        cpf: '12345678901',
        cep: '01001000',
        numero: 100,
        complemento: ''
      });

    const idMontadora = montadora.insertId || montadora.id || 1;
    const idCliente = cliente.body.data.insertId || cliente.body.data.id || 1;

    const resposta = await request(app)
      .post('/veiculos')
      .send({
        idMontadora,
        idCliente,
        modelo: 'Uno',
        placa: 'ABC1D23',
        ano: 2020,
        cor: 'Vermelho',
        valor: 25000
      });

    expect(resposta.status).toBe(201);
  });

  it('CT-012 - Deve listar os veículos', async () => {
    const resposta = await request(app).get('/veiculos');

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
  });

  it('CT-013 - Deve atualizar um veículo', async () => {
    const resposta = await request(app)
      .put('/veiculos?id=1')
      .send({
        idMontadora: 1,
        idCliente: 1,
        modelo: 'Uno Atualizado',
        placa: 'ABC1D23',
        ano: 2020,
        cor: 'Azul',
        valor: 25000
      });

    expect(resposta.status).toBe(200);
  });

  it('CT-014 - Deve excluir um veículo', async () => {
    const resposta = await request(app).delete('/veiculos/1');

    expect(resposta.status).toBe(200);
  });

  // NEGATIVOS

  it('CT-022 - Deve retornar erro ao cadastrar veículo sem dados', async () => {
    const resposta = await request(app)
      .post('/veiculos')
      .send({});

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

  it('CT-023 - Deve retornar erro ao cadastrar veículo com montadora inexistente', async () => {
    const resposta = await request(app)
      .post('/veiculos')
      .send({
        idMontadora: 999999,
        idCliente: 999999,
        modelo: 'Uno',
        placa: 'ABC1D23',
        ano: 2020,
        cor: 'Vermelho',
        valor: 25000
      });

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

  it('CT-024 - Deve retornar erro ao cadastrar veículo sem modelo', async () => {
    const resposta = await request(app)
      .post('/veiculos')
      .send({
        idMontadora: 1,
        idCliente: 1,
        placa: 'ABC1D23',
        ano: 2020,
        cor: 'Vermelho',
        valor: 25000
      });

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

  it('CT-025 - Deve retornar erro ao cadastrar veículo com ano inválido', async () => {
    const resposta = await request(app)
      .post('/veiculos')
      .send({
        idMontadora: 1,
        idCliente: 1,
        modelo: 'Uno',
        placa: 'ABC1D23',
        ano: 'invalido',
        cor: 'Vermelho',
        valor: 25000
      });

    expect(resposta.status).toBeGreaterThanOrEqual(400);
  });

});
