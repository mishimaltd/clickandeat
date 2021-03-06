package com.ezar.clickandeat.util;

import com.ezar.clickandeat.config.MessageFactory;

import java.text.DecimalFormat;
import java.text.NumberFormat;

public class NumberUtil {

    private static final NumberFormat generalFormatter;
    private static final NumberFormat formatter;
    private static final NumberFormat strictFormatter;
    private static final NumberFormat paymentFormatter;

    static {

        generalFormatter = DecimalFormat.getInstance(MessageFactory.getLocale());
        generalFormatter.setMinimumFractionDigits(0);
        generalFormatter.setMaximumFractionDigits(2);

        formatter = DecimalFormat.getInstance(MessageFactory.getLocale());
        formatter.setMinimumFractionDigits(2);
        formatter.setMaximumFractionDigits(2);

        strictFormatter = DecimalFormat.getInstance(MessageFactory.getLocale());
        strictFormatter.setMinimumFractionDigits(0);
        strictFormatter.setMaximumFractionDigits(0);
        strictFormatter.setGroupingUsed(false);

        paymentFormatter = DecimalFormat.getInstance(MessageFactory.getLocale());
        paymentFormatter.setMinimumFractionDigits(0);
        paymentFormatter.setMaximumFractionDigits(0);
        paymentFormatter.setGroupingUsed(false);
    }


    public static String formatGeneral(Double in) {
        return in == null? "": generalFormatter.format(in);
    }

    public static String format(Double in) {
        return in == null? "": formatter.format(in);
    }

    public static String formatStrict(Double in) {
        return in == null? "": strictFormatter.format(in);
    }

    public static String formatForCardPayment(Double in) {
        return in == null? "": paymentFormatter.format(in * 100);
    }
}
