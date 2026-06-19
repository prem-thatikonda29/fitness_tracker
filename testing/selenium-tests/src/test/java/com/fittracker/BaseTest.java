package com.fittracker;

import com.fittracker.config.TestConfig;
import com.fittracker.config.WebDriverFactory;
import com.fittracker.pages.SignInPage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

import java.time.Duration;

public abstract class BaseTest {

    protected WebDriver driver;
    protected TestConfig config;
    protected WebDriverWait wait;
    protected WebDriverWait longWait;

    @BeforeClass
    public void setupDriver() {
        config = TestConfig.get();
        driver = WebDriverFactory.createDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(config.getWaitTimeout()));
        longWait = new WebDriverWait(driver, Duration.ofSeconds(config.getWaitTimeout()));
    }

    @AfterClass
    public void teardownDriver() {
        System.out.println("[BaseTest] Tearing down WebDriver");
        WebDriverFactory.quitDriver(driver);
    }

    protected void signIn() {
        System.out.println("[BaseTest] Starting sign-in flow for email: " + config.getTestEmail());

        SignInPage signInPage = new SignInPage(driver, config.getWaitTimeout());
        signInPage.navigate(config.getBaseUrl());

        System.out.println("[BaseTest] Entering email...");
        signInPage.enterEmail(config.getTestEmail());
        System.out.println("[BaseTest] Email submitted, waiting for password field...");

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("[BaseTest] Entering password...");
        signInPage.enterPassword(config.getTestPassword());
        System.out.println("[BaseTest] Password submitted, waiting for OTP to be sent...");

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("[BaseTest] Entering OTP...");
        signInPage.enterOtp(config.getTestOtp());
        System.out.println("[BaseTest] OTP entered, waiting for redirect to complete...");

        try {
            longWait.until(ExpectedConditions.not(
                    ExpectedConditions.urlContains("sign-in")));
        } catch (Exception e) {
            System.out.println("[BaseTest] Timeout waiting for redirect from sign-in. Current URL: " + driver.getCurrentUrl());
        }

        try {
            Thread.sleep(2000);
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.cssSelector("[data-testid=\"calendar-header\"]")));
            System.out.println("[BaseTest] Sign-in complete — landed on home page");
        } catch (Exception e) {
            System.out.println("[BaseTest] Calendar header didn't appear after sign-in. Current URL: " + driver.getCurrentUrl());
            driver.navigate().to(config.getBaseUrl() + "/");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
