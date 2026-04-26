package com.giftmart.util;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

/**
 * Checks if an email domain has MX records (accepts mail). Does not verify that the specific
 * mailbox exists (e.g. aathi@gmail.com) — that's impossible without provider support.
 */
public final class EmailValidation {

    private EmailValidation() {
    }

    /**
     * Returns true if the domain has at least one MX record (can receive email). Returns false if
     * the domain has no MX records or lookup fails (treat as invalid to be safe).
     */
    public static boolean domainHasMxRecords(String domain) {
        if (domain == null || domain.isBlank()) return false;
        String d = domain.toLowerCase().trim();
        if (d.isEmpty()) return false;
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            env.put("java.naming.provider.url", "dns://8.8.8.8/");
            DirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(d, new String[]{"MX"});
            Attribute mxAttr = attrs.get("MX");
            return mxAttr != null && mxAttr.size() > 0;
        } catch (NamingException e) {
            return false;
        }
    }
}
