export interface DomainAvailability {
  domain: string;
  isAvailable: boolean;
}

/**
 * NOTE TO DEVELOPERS: This is a MOCK implementation.
 * For this feature to work in production, you need to build a secure backend proxy
 * that calls a real domain registrar's API.
 * 
 * A detailed prompt to build this backend using a serverless function can be found in:
 * /backend_prompt.md
 * 
 * This prompt can be used with an IDE assistant (like VS Code's Copilot) or another AI
 * to generate the necessary backend code.
 */

/**
 * Fetches the user's country code to suggest a local TLD.
 * Uses a free, privacy-friendly IP geolocation service.
 */
export async function getSuggestedTld(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return '.com'; // Default on failure
    const data = await response.json();
    const countryTld = `.${data.country_code.toLowerCase()}`;
    
    // Simple mapping for common multi-level TLDs
    const tldMap: { [key: string]: string } = {
      '.za': '.co.za',
      '.uk': '.co.uk',
      '.nz': '.co.nz',
      '.au': '.com.au',
      '.jp': '.co.jp',
      '.kr': '.co.kr',
    };

    return tldMap[countryTld] || countryTld;
  } catch (error) {
    console.error("Could not fetch user location for TLD suggestion:", error);
    return '.com'; // Default on any error
  }
}


/**
 * Checks the availability of a list of domain names against a specific TLD.
 * This is a MOCK implementation.
 * @param names - An array of business names to check (without TLDs).
 * @param tld - The Top-Level Domain to check (e.g., '.com', '.co.za').
 * @returns A promise that resolves to an array of domain availability statuses.
 */
export async function checkDomainAvailability(names: string[], tld: string): Promise<DomainAvailability[]> {
  // Simulate API call latency to the backend proxy
  await new Promise(resolve => setTimeout(resolve, 750));

  console.log(`MOCK: Checking domains with TLD: ${tld}`);

  // Mock response - marks about half as available for demonstration
  return names.map(name => {
    const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '') + tld;
    return {
      domain,
      isAvailable: Math.random() > 0.5,
    };
  });
}
