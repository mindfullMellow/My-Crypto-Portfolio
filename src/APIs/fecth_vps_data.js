const VPSkey = import.meta.env.VITE_VPS_API_KEY;

export async function fecth_vps_data() {
  try {
    const res = await fetch("http://176.123.2.135:5001/binance-data", {
      headers: {
        "X-API-KEY": VPSkey,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    console.log(data); // see the data here
    return data; // return it so other files can use
  } catch (err) {
    console.error(err);
  }
}
