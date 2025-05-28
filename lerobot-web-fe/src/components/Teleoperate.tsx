export default function Teleoperate() {
  const startTeleoperate = async () => {
    const res = await fetch("http://127.0.0.1:8000/start-teleoperate", {
      method: "POST",
    });

    const data = await res.json();
    console.log("Teleoperate response: ", data);
  };

  return <button onClick={startTeleoperate}>Start teleoperate</button>;
}
