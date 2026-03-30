using ZSD from '../db/schema';

service SalesOrderService {

    // Sales Order Header
    entity ZSO_VBAK as projection on ZSD.ZSO_VBAK;

    // Sales Order Items
    entity ZSO_VBAP as projection on ZSD.ZSO_VBAP;
}