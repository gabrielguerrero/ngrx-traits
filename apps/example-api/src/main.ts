import express from 'express';

import { getBranchDetail, searchBranches } from './shared/branches.service';
import { Category, OrderSummary } from './shared/models';
import {
  deleteOrder,
  getOrderDetail,
  searchOrders,
  updateOrder,
} from './shared/orders.service';
import {
  getProductDetail,
  processCheckout,
  searchProducts,
} from './shared/product.service';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());

// ===== PRODUCT ROUTES =====
app.post('/api/checkout', (req, res) => {
  const orderId = processCheckout();
  res.json(orderId);
});

app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const productDetail = getProductDetail(id);
  res.json(productDetail);
});

app.get('/api/products', (req, res) => {
  const options = {
    search: req.query.search as string,
    sortColumn: req.query.sortColumn as string,
    sortAscending: req.query.sortAscending as string,
    category: req.query.category as Category,
    skip: req.query.skip as string,
    take: req.query.take as string,
  };
  const response = searchProducts(options);
  res.json(response);
});

// ===== BRANCH ROUTES =====
app.get('/api/branches', (req, res) => {
  const options = {
    search: req.query.search as string,
    sortColumn: req.query.sortColumn as string,
    sortAscending: req.query.sortAscending as string,
    skip: req.query.skip as string,
    take: req.query.take as string,
  };
  const response = searchBranches(options);
  res.json(response);
});

app.get('/api/branches/:id', (req, res) => {
  const id = req.params.id as string;
  const branchDetail = getBranchDetail(id);
  res.json(branchDetail);
});

// ===== ORDER ROUTES =====
app.get('/api/orders', (req, res) => {
  const options = {
    search: req.query.search as string,
    sortColumn: req.query.sortColumn as string,
    sortAscending: req.query.sortAscending as string,
    skip: req.query.skip as string,
    take: req.query.take as string,
  };
  const response = searchOrders(options);
  res.json(response);
});

app.get('/api/orders/:id', (req, res) => {
  const id = req.params.id as string;
  const orderDetail = getOrderDetail(id);
  res.json(orderDetail);
});

app.put('/api/orders/:id', (req, res) => {
  const id = req.params.id as string;
  const body = req.body as { status: OrderSummary['status'] };
  const result = updateOrder({ id, changes: body });
  res.json(result);
});

app.delete('/api/orders/:id', (req, res) => {
  const id = req.params.id as string;
  const result = deleteOrder({ id });
  res.json(result);
});

app.listen(port, host, () => {
  console.log(`Mock API server listening on http://${host}:${port}`);
});
