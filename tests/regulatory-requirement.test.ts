import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract interactions
const mockContract = {
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  requirements: new Map(),
  productCompliance: new Map(),
  
  addRequirement(requirementId, title, description, requiredDocuments, sender) {
    if (sender !== this.admin) {
      return { error: 403 };
    }
    
    if (this.requirements.has(requirementId)) {
      return { error: 500 };
    }
    
    this.requirements.set(requirementId, {
      title,
      description,
      requiredDocuments,
      active: true,
      createdAt: 12345
    });
    
    return { success: true };
  },
  
  updateProductCompliance(productId, requirementId, documents) {
    if (!this.requirements.has(requirementId)) {
      return { error: 404 };
    }
    
    const key = `${productId}-${requirementId}`;
    this.productCompliance.set(key, {
      compliant: true,
      documents,
      lastUpdated: 12345
    });
    
    return { success: true };
  },
  
  isProductCompliant(productId, requirementId) {
    const key = `${productId}-${requirementId}`;
    if (!this.productCompliance.has(key)) {
      return { error: 404 };
    }
    
    return { success: this.productCompliance.get(key).compliant };
  },
  
  getRequirement(requirementId) {
    if (!this.requirements.has(requirementId)) {
      return null;
    }
    
    return this.requirements.get(requirementId);
  },
  
  getProductCompliance(productId, requirementId) {
    const key = `${productId}-${requirementId}`;
    if (!this.productCompliance.has(key)) {
      return null;
    }
    
    return this.productCompliance.get(key);
  }
};

describe('Regulatory Requirements Contract', () => {
  beforeEach(() => {
    mockContract.requirements.clear();
    mockContract.productCompliance.clear();
    mockContract.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  });
  
  it('should add a new regulatory requirement', () => {
    const result = mockContract.addRequirement(
        'req-001',
        'ISO 9001',
        'Quality Management System Requirements',
        ['quality-manual', 'process-documentation', 'audit-reports'],
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    );
    
    expect(result.success).toBe(true);
    expect(mockContract.requirements.has('req-001')).toBe(true);
    
    const requirement = mockContract.getRequirement('req-001');
    expect(requirement.title).toBe('ISO 9001');
    expect(requirement.description).toBe('Quality Management System Requirements');
    expect(requirement.requiredDocuments).toEqual(['quality-manual', 'process-documentation', 'audit-reports']);
    expect(requirement.active).toBe(true);
  });
  
  it('should not allow non-admin to add requirements', () => {
    const result = mockContract.addRequirement(
        'req-002',
        'ISO 14001',
        'Environmental Management System Requirements',
        ['environmental-policy', 'compliance-records'],
        'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    );
    
    expect(result.error).toBe(403);
    expect(mockContract.requirements.has('req-002')).toBe(false);
  });
  
  it('should update product compliance', () => {
    mockContract.addRequirement(
        'req-003',
        'FDA 21 CFR Part 11',
        'Electronic Records Requirements',
        ['validation-documentation', 'system-logs'],
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    );
    
    const result = mockContract.updateProductCompliance(
        'product-001',
        'req-003',
        ['doc-001', 'doc-002']
    );
    
    expect(result.success).toBe(true);
    
    const compliance = mockContract.getProductCompliance('product-001', 'req-003');
    expect(compliance.compliant).toBe(true);
    expect(compliance.documents).toEqual(['doc-001', 'doc-002']);
  });
  
  it('should check if a product is compliant', () => {
    mockContract.addRequirement(
        'req-004',
        'EU MDR',
        'Medical Device Regulation',
        ['technical-documentation', 'clinical-evaluation'],
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    );
    
    mockContract.updateProductCompliance(
        'product-002',
        'req-004',
        ['doc-003', 'doc-004']
    );
    
    const result = mockContract.isProductCompliant('product-002', 'req-004');
    expect(result.success).toBe(true);
    
    const nonExistentResult = mockContract.isProductCompliant('product-999', 'req-004');
    expect(nonExistentResult.error).toBe(404);
  });
});
