const token = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdW11a2hhYWNoYXJ5YTg5NTFAZ21haWwuY29tIiwidXNlcklkIjozLCJlbWFpbCI6InN1bXVraGFhY2hhcnlhODk1MUBnbWFpbC5jb20iLCJyb2xlIjoiVFBPIiwiaWF0IjoxNzc3MjY3ODcyLCJleHAiOjE3NzcyNjg3NzJ9.ohLIqblqtCX4Og6ebUryxP3CBdnThIzOKFdmQGOzhw3naLkwpJkhqL514fN55TcN";

async function test() {
  console.log('1. Trying Gateway (8080)...');
  try {
    const res = await fetch('http://localhost:8080/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: "asd",
        email: "asd@asd.com",
        industry: "TECHNOLOGY",
        website: "",
        location: "",
        description: ""
      })
    });
    
    console.log('Gateway status:', res.status);
    const text = await res.text();
    console.log('Gateway body:', text);
  } catch (e) {
    console.log('Gateway threw:', e.message);
  }
}

test().catch(console.error);
