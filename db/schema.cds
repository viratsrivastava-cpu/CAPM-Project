namespace ZSD;

// Sales Order Header
entity ZSO_VBAK {
    key VBELN   : String(10);   // Sales Order Number (Primary Key)
        ERDAT   : Date;         // Creation Date
        KUNNR   : String(10);   // Customer Number (FK → ZKN A1)
        ERNAM   : String(12);   // Name of person who created

        // Composition - Header owns Items
        // If Header deleted, Items also deleted
        Items   : Composition of many ZSO_VBAP
                  on Items.VBELN = $self.VBELN;
}

// Sales Order Items
entity ZSO_VBAP {
    key VBELN   : String(10);   // Sales Order Number (FK → ZSO_VBAK)
    key POSNR   : String(6);    // Line Item Number
        MATNR   : String(18);   // Material Number (FK → ZMARA)
        MATKL   : String(9);    // Material Group
        MENGE   : Decimal(13,3);// Quantity
        MEINS   : String(3);    // Unit of Measure
        NETPR   : Decimal(11,2);// Net Price
        PEINH   : String(3);    // Price Unit

        // Association - Item refers back to Header
        Header  : Association to ZSO_VBAK
                  on Header.VBELN = $self.VBELN;
}