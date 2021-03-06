package com.ezar.clickandeat.util;

import org.springframework.util.StringUtils;

import java.text.Normalizer;

public class StringUtil {


    /**
     * @param str1
     * @param str2
     * @return
     */

    public static boolean equals(String str1, String str2 ) {
        if( (str1 == null || "null".equals(str1)) && (str2 == null || "null".equals(str2))) {
            return true;
        }
        else if( str1 != null && str2 != null && str1.equals(str2)) {
            return true;
        }
        return false;
    }


    /**
     * @param in
     * @param requiredLength
     * @return
     */

    public static String padZeros(String in, int requiredLength) {
        int requiredPadding = in == null? 0: in.length();
        StringBuilder sb = new StringBuilder();
        for( int i = 0; i < requiredLength - requiredPadding; i++ ) {
            sb.append("0");
        }
        return sb.toString() + in;
    }
    
    public static String escape(String in) {
        if( !StringUtils.hasText(in)) {
            return in;
        }
        in = in.replace("'","###");
        in = in.replace("\n","<br>");
        in = in.replace(" ","_");
        return in;
    }
    
    public static String normalise(String in) {
        String normalised = Normalizer.normalize(in, Normalizer.Form.NFD);
        normalised = normalised.replaceAll("[^\\p{ASCII}]", "");
        return normalised;
    }
    
}
