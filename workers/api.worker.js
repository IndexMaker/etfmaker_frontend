self.onmessage = async (e) => {
  const { url, options } = e.data;
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    self.postMessage({ status: 'success', data });
  } catch (error) {
    self.postMessage({ status: 'error', error: error.message });
  }
};