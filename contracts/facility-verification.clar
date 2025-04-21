;; Facility Verification Contract
;; Validates legitimate production locations

(define-data-var admin principal tx-sender)

;; Map to store verified facilities
(define-map verified-facilities
  { facility-id: (string-ascii 64) }
  {
    name: (string-ascii 100),
    location: (string-ascii 100),
    verified: bool,
    verification-date: uint
  }
)

;; Add a new facility
(define-public (register-facility (facility-id (string-ascii 64)) (name (string-ascii 100)) (location (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (map-insert verified-facilities
      { facility-id: facility-id }
      {
        name: name,
        location: location,
        verified: false,
        verification-date: u0
      }
    ))
  )
)

;; Verify a facility
(define-public (verify-facility (facility-id (string-ascii 64)))
  (let ((facility (unwrap! (map-get? verified-facilities { facility-id: facility-id }) (err u404))))
    (begin
      (asserts! (is-eq tx-sender (var-get admin)) (err u403))
      (ok (map-set verified-facilities
        { facility-id: facility-id }
        (merge facility {
          verified: true,
          verification-date: block-height
        })
      ))
    )
  )
)

;; Check if a facility is verified
(define-read-only (is-facility-verified (facility-id (string-ascii 64)))
  (match (map-get? verified-facilities { facility-id: facility-id })
    facility (ok (get verified facility))
    (err u404)
  )
)

;; Get facility details
(define-read-only (get-facility (facility-id (string-ascii 64)))
  (map-get? verified-facilities { facility-id: facility-id })
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok (var-set admin new-admin))
  )
)
