PATTERNS: dict[str, list[str]] = {
    "data_selling": [
        "sell your data", "sell personal information", "sell your personal",
        "monetize your data", "sold to third parties",
    ],
    "forced_consent": [
        "by using this service you agree", "continued use constitutes",
        "using the service means you accept", "by accessing you agree",
        "continuing to use constitutes acceptance",
    ],
    "auto_renewal": [
        "automatic renewal", "auto-renew", "automatically charged",
        "automatically billed", "will renew automatically",
        "subscription will automatically continue", "automatically renew",
    ],
    "silent_updates": [
        "without notice", "without prior notice", "may change at any time",
        "right to modify", "reserve the right to update",
        "updated terms will be effective immediately",
    ],
    "data_sharing": [
        "share with third", "share with our affiliates",
        "disclose to partners", "provide to advertisers",
        "transfer to service providers",
    ],
    "indefinite_retention": [
        "retain indefinitely", "keep your data as long",
        "no obligation to delete", "stored permanently",
        "may keep your information after",
    ],
    "device_access": [
        "access your contacts", "access your camera",
        "access your microphone", "access your location",
        "access your files", "read your messages",
    ],
    "liability_waiver": [
        "not liable for any damages", "disclaim all warranties",
        "maximum extent permitted by law", "in no event shall we be liable",
        "waive any claims against",
    ],
    "unilateral_changes": [
        "sole discretion", "at our sole discretion",
        "may modify these terms", "reserves the right to change",
    ],
    "binding_arbitration": [
        "binding arbitration", "waive right to sue",
        "class action", "waive your right to",
        "arbitration instead of court",
    ],
    "broad_surveillance": [
        "collect location", "track your activity",
        "track your location", "monitor your usage",
        "record your interactions",
    ],
    "third_party_sharing": [
        "third-party partners", "third party advertisers",
        "share with advertisers", "disclose to our partners",
        "transfer to third parties",
    ],
}

ISSUE_LABELS: dict[str, str] = {
    "data_selling": "Data sold to third parties",
    "forced_consent": "Forced consent through usage",
    "auto_renewal": "Automatic renewal without clear notice",
    "silent_updates": "Terms can change without notice",
    "data_sharing": "Personal data shared with third parties",
    "indefinite_retention": "Data retained indefinitely",
    "device_access": "Broad device access requested",
    "liability_waiver": "Liability waiver imposed on user",
    "unilateral_changes": "Terms can change at sole discretion",
    "binding_arbitration": "Binding arbitration clause present",
    "broad_surveillance": "Broad data collection and surveillance",
    "third_party_sharing": "Data shared with third-party partners",
}

def detect(clause: str) -> list[str]:
    lower = clause.lower()
    return [tag for tag, keywords in PATTERNS.items() if any(kw in lower for kw in keywords)]
