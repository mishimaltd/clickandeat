package com.ezar.clickandeat.repository;

import com.ezar.clickandeat.model.Voucher;

public interface VoucherRepositoryCustom {

    Voucher findByVoucherId(String voucherId);
    
    Voucher saveVoucher(Voucher voucher);
    
    Voucher createVoucher();

    Voucher createVoucher(Double discount);
    
    void markVoucherUsed(String voucherId);
    
    void markVoucherUnused(String voucherId);

}
