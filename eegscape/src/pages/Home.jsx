function Home() {
  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
      </div>

      <div className="space-y-4">
        <p>This line will have instructions on connecting the headset</p>
        <p>
          This line will instruct the user how to proceed to click the button
          once the headset is connected
        </p>
      </div>

      <div>
        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
          Continue
        </button>
      </div>
    </div>
  );
}

export default Home;