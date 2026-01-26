export default function MergePrompt({
  localCount,
  cloudCount,
  onKeepBoth,
  onUseCloud,
  onUseLocal,
  onDismiss
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2">
          Merge Your Todos?
        </h2>
        <p className="text-gray-400 mb-6">
          You have <span className="text-white font-medium">{localCount}</span> todo{localCount !== 1 ? 's' : ''} saved locally
          {cloudCount > 0 && (
            <> and <span className="text-white font-medium">{cloudCount}</span> in the cloud</>
          )}.
          How would you like to proceed?
        </p>

        <div className="space-y-3">
          <button
            onClick={onKeepBoth}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Keep both ({localCount + cloudCount} total)
          </button>
          
          {cloudCount > 0 && (
            <button
              onClick={onUseCloud}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Use cloud only ({cloudCount})
            </button>
          )}
          
          <button
            onClick={onUseLocal}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {cloudCount > 0 ? `Replace cloud with local (${localCount})` : `Use local (${localCount})`}
          </button>
        </div>

        <button
          onClick={onDismiss}
          className="w-full mt-4 text-sm text-gray-400 hover:text-white transition-colors py-2"
        >
          Dismiss (discard local todos)
        </button>
      </div>
    </div>
  )
}
