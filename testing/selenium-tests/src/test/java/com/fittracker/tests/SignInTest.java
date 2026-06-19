package com.fittracker.tests;

import com.fittracker.BaseTest;
import com.fittracker.pages.SignInPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SignInTest extends BaseTest {

    @Test(priority = 1)
    public void testSuccessfulSignIn() {
        System.out.println("[TEST] testSuccessfulSignIn started");
        signIn();

        SignInPage signInPage = new SignInPage(driver, config.getWaitTimeout());
        Assert.assertTrue(signInPage.isSignedIn(),
                "Expected to be redirected away from sign-in after valid credentials");
        System.out.println("[TEST] testSuccessfulSignIn PASSED");
    }

    @Test(priority = 2)
    public void testInvalidPasswordRejected() {
        System.out.println("[TEST] testInvalidPasswordRejected started");
        // Clear cookies so Clerk shows the actual sign-in page (not auto-redirect)
        driver.manage().deleteAllCookies();
        driver.navigate().refresh();

        SignInPage signInPage = new SignInPage(driver, config.getWaitTimeout());
        signInPage.navigate(config.getBaseUrl());

        signInPage.enterEmail(config.getTestEmail());

        org.openqa.selenium.By passwordInput =
                org.openqa.selenium.By.cssSelector("input[name=\"password\"]");
        wait.until(org.openqa.selenium.support.ui.ExpectedConditions
                .visibilityOfElementLocated(passwordInput))
                .sendKeys("definitely-wrong-password");
        driver.findElement(org.openqa.selenium.By.cssSelector(".cl-formButtonPrimary")).click();

        Assert.assertTrue(signInPage.isOnSignInPage(),
                "Expected to stay on sign-in page after invalid password");
        System.out.println("[TEST] testInvalidPasswordRejected PASSED");
    }
}
