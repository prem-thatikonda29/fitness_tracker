pipeline {
    agent any

    environment {
        BASE_URL = 'http://localhost:3000'
        PATH = "/Users/premthatikonda/.nvm/versions/node/v25.2.1/bin:/opt/homebrew/bin:/usr/bin:/bin"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Start Dev Server') {
            steps {
                sh '''
                    cat > .env.local <<EOF
DATABASE_URL=${DATABASE_URL}
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
EOF
                '''
                sh 'npm run dev > /tmp/nextdev.log 2>&1 &'
                sh '''
                    for i in $(seq 1 60); do
                        if curl -s http://localhost:3000 > /dev/null 2>&1; then
                            echo "Dev server is up on port 3000"
                            break
                        fi
                        sleep 1
                    done
                '''
            }
        }

        stage('Cypress Tests') {
            steps {
                withEnv([
                    "CYPRESS_test_email=${TEST_EMAIL}",
                    "CYPRESS_test_password=${TEST_PASSWORD}",
                    "CYPRESS_test_otp=${TEST_OTP}"
                ]) {
                    sh 'npx cypress run'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*', allowEmptyArchive: true
                }
            }
        }

        stage('Selenium Tests') {
            steps {
                dir('selenium-tests') {
                    sh """
                        mvn clean test \
                            -Dtest.email=${TEST_EMAIL} \
                            -Dtest.password=${TEST_PASSWORD} \
                            -Dtest.otp=${TEST_OTP} \
                            -Dbase.url=${BASE_URL}
                    """
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'selenium-tests/target/surefire-reports',
                        reportFiles: 'index.html',
                        reportName: 'Selenium Test Report'
                    ])
                    junit allowEmptyResults: true, testResults: 'selenium-tests/target/surefire-reports/**/*.xml'
                }
            }
        }
    }

    post {
        always {
            sh 'pkill -f "next dev" || true'
            sh 'pkill -f "node.*next" || true'
        }
        failure {
            archiveArtifacts artifacts: '/tmp/nextdev.log', allowEmptyArchive: true
        }
    }
}
