package com.fittracker.config;

public class TestConfig {

    private static final TestConfig INSTANCE = new TestConfig();

    private final String baseUrl;
    private final String testEmail;
    private final String testPassword;
    private final String testOtp;
    private final int waitTimeout;

    private TestConfig() {
        this.baseUrl = resolve("base.url", "BASE_URL", "http://localhost:3000");
        this.testEmail = resolve("test.email", "TEST_EMAIL", null);
        this.testPassword = resolve("test.password", "TEST_PASSWORD", null);
        this.testOtp = resolve("test.otp", "TEST_OTP", "424242");
        this.waitTimeout = Integer.parseInt(resolve("wait.timeout", "WAIT_TIMEOUT", "10"));
    }

    private String resolve(String sysProp, String envVar, String defaultValue) {
        String val = System.getProperty(sysProp);
        if (val != null && !val.isEmpty()) return val;
        val = System.getenv(envVar);
        if (val != null && !val.isEmpty()) return val;
        if (defaultValue != null) return defaultValue;
        throw new IllegalStateException("Missing required config: " + sysProp + " or " + envVar);
    }

    public static TestConfig get() { return INSTANCE; }

    public String getBaseUrl() { return baseUrl; }
    public String getTestEmail() { return testEmail; }
    public String getTestPassword() { return testPassword; }
    public String getTestOtp() { return testOtp; }
    public int getWaitTimeout() { return waitTimeout; }
}
