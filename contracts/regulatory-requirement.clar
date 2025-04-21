;; Regulatory Requirements Contract
;; Defines mandatory documentation

(define-data-var admin principal tx-sender)

;; Map to store regulatory requirements
(define-map regulatory-requirements
  { requirement-id: (string-ascii 64) }
  {
    title: (string-ascii 100),
    description: (string-ascii 255),
    required-documents: (list 10 (string-ascii 64)),
    active: bool,
    created-at: uint
  }
)

;; Map to track compliance by product
(define-map product-compliance
  {
    product-id: (string-ascii 64),
    requirement-id: (string-ascii 64)
  }
  {
    compliant: bool,
    documents: (list 10 (string-ascii 64)),
    last-updated: uint
  }
)

;; Add a new regulatory requirement
(define-public (add-requirement
    (requirement-id (string-ascii 64))
    (title (string-ascii 100))
    (description (string-ascii 255))
    (required-documents (list 10 (string-ascii 64))))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (map-insert regulatory-requirements
      { requirement-id: requirement-id }
      {
        title: title,
        description: description,
        required-documents: required-documents,
        active: true,
        created-at: block-height
      }
    ))
  )
)

;; Update a product's compliance status
(define-public (update-product-compliance
    (product-id (string-ascii 64))
    (requirement-id (string-ascii 64))
    (documents (list 10 (string-ascii 64))))
  (let ((requirement (unwrap! (map-get? regulatory-requirements { requirement-id: requirement-id }) (err u404))))
    (begin
      (ok (map-set product-compliance
        {
          product-id: product-id,
          requirement-id: requirement-id
        }
        {
          compliant: true,
          documents: documents,
          last-updated: block-height
        }
      ))
    )
  )
)

;; Check if a product is compliant with a requirement
(define-read-only (is-product-compliant (product-id (string-ascii 64)) (requirement-id (string-ascii 64)))
  (match (map-get? product-compliance { product-id: product-id, requirement-id: requirement-id })
    compliance (ok (get compliant compliance))
    (err u404)
  )
)

;; Get requirement details
(define-read-only (get-requirement (requirement-id (string-ascii 64)))
  (map-get? regulatory-requirements { requirement-id: requirement-id })
)

;; Get product compliance details
(define-read-only (get-product-compliance (product-id (string-ascii 64)) (requirement-id (string-ascii 64)))
  (map-get? product-compliance { product-id: product-id, requirement-id: requirement-id })
)
