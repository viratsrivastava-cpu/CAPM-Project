using ZSD from '../db/schema';

service SalesOrderService {

    entity ZSO_VBAK as projection on ZSD.ZSO_VBAK;
    entity ZSO_VBAP as projection on ZSD.ZSO_VBAP;
}

annotate SalesOrderService.ZSO_VBAK with @(
    UI.LineItem: [
        { Value: VBELN, Label: 'VBELN' },
        { Value: ERDAT, Label: 'ERDAT'       },
        { Value: KUNNR, Label: 'KUNNR'       },
        { Value: ERNAM, Label: 'ERNAM'       }
    ],
    UI.HeaderInfo: {
        TypeName      : 'Sales Order',
        TypeNamePlural: 'Sales Orders',
        Title         : { Value: VBELN },
        Description   : { Value: KUNNR }
    },
    UI.FieldGroup #GeneralInfo: {
        Label: 'Sales Order',
        Data : [
            { Value: VBELN, Label: 'VBELN' },
            { Value: ERDAT, Label: 'ERDAT' },
            { Value: KUNNR, Label: 'KUNNR' },
            { Value: ERNAM, Label: 'ERNAM' }
        ]
    },
    UI.Facets: [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Sales Order',
            Target: '@UI.FieldGroup#GeneralInfo'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Sales Items',
            Target: 'Items/@UI.LineItem'
        }
    ]
);

annotate SalesOrderService.ZSO_VBAP with @(
    UI.LineItem: [
        { Value: VBELN, Label: 'VBELN' },
        { Value: POSNR, Label: 'POSNR' },
        { Value: MATNR, Label: 'MATNR' },
        { Value: MATKL, Label: 'MATKL' },
        { Value: MENGE, Label: 'MENGE' },
        { Value: MEINS, Label: 'MEINS' },
        { Value: NETPR, Label: 'NETPR' },
        { Value: PEINH, Label: 'PEINH' }
    ],
    UI.HeaderInfo: {
        TypeName      : 'Sales Items',
        TypeNamePlural: 'Sales Items',
        Title         : { Value: POSNR },
        Description   : { Value: MATNR }
    },
    UI.FieldGroup #ItemInfo: {
        Label: 'Sales Items',
        Data : [
            { Value: VBELN, Label: 'VBELN' },
            { Value: POSNR, Label: 'POSNR' },
            { Value: MATNR, Label: 'MATNR' },
            { Value: MATKL, Label: 'MATKL' },
            { Value: MENGE, Label: 'MENGE' },
            { Value: MEINS, Label: 'MEINS' },
            { Value: NETPR, Label: 'NETPR' },
            { Value: PEINH, Label: 'PEINH' }
        ]
    },
    UI.Facets: [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Sales Items',
            Target: '@UI.FieldGroup#ItemInfo'
        }
    ]
);