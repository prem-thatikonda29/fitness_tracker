package com.fittracker.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class SignInPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By emailInput = By.cssSelector("input[name=\"identifier\"]");
    private final By continueButton = By.cssSelector(".cl-formButtonPrimary");
    private final By passwordInput = By.cssSelector("input[name=\"password\"]");
    private final By otpInput = By.cssSelector("input[inputmode=\"numeric\"]");

    public SignInPage(WebDriver driver, int timeoutSeconds) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
    }

    public void navigate(String baseUrl) {
        driver.get(baseUrl + "/sign-in");
    }

    public void enterEmail(String email) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput)).sendKeys(email);
        driver.findElement(continueButton).click();
    }

    public void enterPassword(String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput)).sendKeys(password);
        driver.findElement(continueButton).click();
    }

    public void enterOtp(String otp) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(otpInput)).sendKeys(otp);
    }

    public void waitForRedirect() {
        wait.until(ExpectedConditions.not(
                ExpectedConditions.urlContains("sign-in")));
    }

    public void signIn(String email, String password, String otp) {
        navigate(driver.getCurrentUrl().contains("/sign-in") ? "" : "http://localhost:3000");
        if (!driver.getCurrentUrl().contains("/sign-in")) {
            driver.get("http://localhost:3000/sign-in");
        }
        enterEmail(email);
        enterPassword(password);
        enterOtp(otp);
    }

    public boolean isSignedIn() {
        return !driver.getCurrentUrl().contains("sign-in");
    }

    public boolean isOnSignInPage() {
        return driver.getCurrentUrl().contains("sign-in");
    }
}
