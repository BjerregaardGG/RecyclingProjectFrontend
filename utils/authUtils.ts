export function verifyfirstAndSecondPassword(
  firstPassword: string,
  secondPassword: string,
  setError: (error: string) => void,
): boolean {
  if (!firstPassword || !secondPassword) {
    setError("Noget gik galt – du skal udfylde adgangskode felterne");
    return false;
  }
  if (firstPassword !== secondPassword) {
    setError("Noget gik galt – dine adgangskoder skal matche");
    return false;
  }
  return true;
}

export function verifyPassword(
  password: string,
  setError: (error: string) => void,
): boolean {
  if (password.length < 8) {
    setError("Din adgangskode skal være mindst 8 tegn");
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    setError("Din adgangskode skal indeholde store bogstaver");
    return false;
  }
  if (!/[a-z]/.test(password)) {
    setError("Din adgangskode skal indeholde små bogstaver");
    return false;
  }
  if (!/[0-9]/.test(password)) {
    setError("Din adgangskode skal indeholde tal");
    return false;
  }
  return true;
}

export function verifyEmail(
  email: string,
  setError: (error: string) => void,
): boolean {
  if (!email) {
    setError("Du skal udfylde email feltet");
    return false;
  }
  if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    setError("Din email er ikke gyldig");
    return false;
  }
  return true;
}
