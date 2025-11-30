# Design Document - Fase 2: Produção e Segurança

## Overview

Design completo para implementação de pagamentos PIX reais, auditoria de segurança abrangente e infraestrutura de produção na AWS. Foco em escalabilidade, segurança e conformidade com padrões de mercado.

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   Load Balancer  │────│   ECS Fargate   │
│     (CDN)       │    │      (ALB)       │    │   (Frontend)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │   ECS Fargate    │────│   RDS MySQL     │
                       │   (Backend API)  │    │   (Database)    │
                       └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Lambda         │────│   S3 Bucket     │
                       │   (Webhooks)     │    │   (Assets)      │
                       └──────────────────┘    └─────────────────┘
```

### PIX Payment Integration
- **Gateway Provider**: Mercado Pago PIX API (recomendado para Brasil)
- **Backup Provider**: PagSeguro PIX (fallback)
- **QR Code Generation**: Dinâmico com expiração
- **Webhook Processing**: Lambda functions para alta disponibilidade

### Security Architecture
- **WAF**: AWS Web Application Firewall
- **DDoS Protection**: AWS Shield Advanced
- **Secrets Management**: AWS Secrets Manager
- **Encryption**: AES-256 at rest, TLS 1.3 in transit

## Components and Interfaces

### PIX Payment Service
```typescript
interface PIXPaymentService {
  generatePayment(amount: number, userId: string): Promise<PIXPayment>;
  validateWebhook(payload: any, signature: string): boolean;
  processPaymentConfirmation(paymentId: string): Promise<void>;
  checkPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

interface PIXPayment {
  id: string;
  qrCode: string;
  pixKey: string;
  amount: number;
  expiresAt: Date;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
}
```

### Security Middleware
```typescript
interface SecurityMiddleware {
  validateCSRF(token: string): boolean;
  sanitizeInput(input: any): any;
  rateLimit(ip: string, endpoint: string): boolean;
  auditLog(action: string, userId: string, metadata: any): void;
}
```

### AWS Infrastructure Components
```typescript
interface AWSInfrastructure {
  vpc: VPCConfig;
  ecs: ECSConfig;
  rds: RDSConfig;
  cloudfront: CloudFrontConfig;
  lambda: LambdaConfig;
}
```

## Data Models

### PIX Transactions
```sql
CREATE TABLE pix_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pix_key VARCHAR(255) NOT NULL,
  qr_code TEXT NOT NULL,
  gateway_transaction_id VARCHAR(255) UNIQUE,
  status ENUM('pending', 'paid', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_gateway_id (gateway_transaction_id),
  INDEX idx_expires_at (expires_at)
);
```

### Security Audit Log
```sql
CREATE TABLE security_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSON,
  risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_action (user_id, action),
  INDEX idx_risk_level (risk_level),
  INDEX idx_created_at (created_at)
);
```

### Rate Limiting
```sql
CREATE TABLE rate_limits (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP or user_id
  endpoint VARCHAR(255) NOT NULL,
  requests_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_limit (identifier, endpoint, window_start),
  INDEX idx_window (window_start)
);
```

## Security Implementation

### Input Validation & Sanitization
```typescript
class SecurityValidator {
  static sanitizeInput(input: any): any {
    // Remove HTML tags, SQL injection patterns
    // Validate data types and ranges
    // Escape special characters
  }
  
  static validateAmount(amount: number): boolean {
    return amount >= 10 && amount <= 10000 && Number.isFinite(amount);
  }
  
  static validatePixKey(key: string): boolean {
    // Validate PIX key formats (CPF, email, phone, random)
  }
}
```

### CSRF Protection
```typescript
class CSRFProtection {
  static generateToken(sessionId: string): string {
    return crypto.createHmac('sha256', process.env.CSRF_SECRET)
                 .update(sessionId)
                 .digest('hex');
  }
  
  static validateToken(token: string, sessionId: string): boolean {
    const expectedToken = this.generateToken(sessionId);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  }
}
```

### Rate Limiting
```typescript
class RateLimiter {
  static async checkLimit(identifier: string, endpoint: string): Promise<boolean> {
    const limits = {
      '/api/payments/pix': { requests: 5, window: 60 }, // 5 per minute
      '/api/auth/login': { requests: 10, window: 300 },  // 10 per 5 minutes
      '/api/user/profile': { requests: 100, window: 60 } // 100 per minute
    };
    
    // Implementation with Redis or database
  }
}
```

## AWS Infrastructure Design

### ECS Fargate Configuration
```yaml
# Frontend Service
frontend:
  cpu: 256
  memory: 512
  replicas: 2
  auto_scaling:
    min: 2
    max: 10
    target_cpu: 70%

# Backend Service  
backend:
  cpu: 512
  memory: 1024
  replicas: 2
  auto_scaling:
    min: 2
    max: 20
    target_cpu: 70%
```

### RDS Configuration
```yaml
rds:
  engine: mysql
  version: 8.0
  instance_class: db.t3.medium
  allocated_storage: 100
  max_allocated_storage: 1000
  multi_az: true
  backup_retention: 7
  encryption: true
  performance_insights: true
```

### Lambda Functions
```yaml
webhooks:
  runtime: nodejs18.x
  memory: 256
  timeout: 30
  environment:
    - NODE_ENV: production
    - DB_HOST: ${rds_endpoint}
  
cleanup:
  runtime: nodejs18.x
  memory: 128
  timeout: 300
  schedule: rate(1 hour) # Clean expired PIX transactions
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Security Audit
        run: |
          npm audit --audit-level high
          snyk test
          
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Tests
        run: |
          npm test
          npm run test:e2e
          
  deploy:
    needs: [security-scan, build-and-test]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prod --service frontend
          aws ecs update-service --cluster prod --service backend
```

## Monitoring and Alerting

### CloudWatch Metrics
- **Application Metrics**: Response time, error rate, throughput
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Business Metrics**: PIX success rate, transaction volume
- **Security Metrics**: Failed login attempts, rate limit hits

### Alerting Rules
```yaml
alerts:
  high_error_rate:
    condition: error_rate > 5%
    duration: 5m
    
  pix_failure_rate:
    condition: pix_failure_rate > 10%
    duration: 2m
    
  security_incident:
    condition: failed_logins > 50/5m
    duration: 1m
```

## Error Handling

### PIX Payment Errors
```typescript
enum PIXErrorCodes {
  GATEWAY_UNAVAILABLE = 'PIX_GATEWAY_UNAVAILABLE',
  INVALID_AMOUNT = 'PIX_INVALID_AMOUNT',
  EXPIRED_PAYMENT = 'PIX_EXPIRED_PAYMENT',
  WEBHOOK_VALIDATION_FAILED = 'PIX_WEBHOOK_INVALID'
}

class PIXErrorHandler {
  static handle(error: PIXError): APIResponse {
    switch (error.code) {
      case PIXErrorCodes.GATEWAY_UNAVAILABLE:
        return { success: false, message: 'Serviço PIX temporariamente indisponível' };
      // ... other cases
    }
  }
}
```

## Testing Strategy

### Security Testing
- **OWASP ZAP**: Automated security scanning
- **Penetration Testing**: Manual security assessment
- **Dependency Scanning**: Snyk for vulnerable packages
- **Code Analysis**: SonarQube for security hotspots

### Load Testing
- **Artillery.js**: API load testing
- **Lighthouse CI**: Performance testing
- **AWS Load Testing**: Infrastructure stress testing

### PIX Integration Testing
- **Sandbox Testing**: Gateway sandbox environment
- **Webhook Testing**: Mock webhook scenarios
- **End-to-End**: Complete payment flow testing

## Compliance and Privacy

### LGPD Compliance
- **Data Mapping**: Catalog of personal data collected
- **Consent Management**: User consent tracking
- **Data Portability**: Export user data functionality
- **Right to Erasure**: Delete user data on request
- **Privacy by Design**: Default privacy settings

### PCI DSS Considerations
- **Data Minimization**: Store only necessary payment data
- **Tokenization**: Replace sensitive data with tokens
- **Access Controls**: Restrict payment data access
- **Audit Trails**: Log all payment data access

## Deployment Strategy

### Blue-Green Deployment
1. **Blue Environment**: Current production
2. **Green Environment**: New version deployment
3. **Traffic Switch**: Gradual traffic migration
4. **Rollback Plan**: Instant switch back if issues

### Database Migrations
- **Backward Compatible**: New columns nullable initially
- **Gradual Migration**: Migrate data in batches
- **Rollback Scripts**: Prepared rollback procedures
- **Testing**: Staging environment validation