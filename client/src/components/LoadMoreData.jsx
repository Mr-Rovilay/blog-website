import PropTypes from 'prop-types';

const LoadMoreData = ({ state, fetchDataFun }) => {
  // Safeguard to ensure state and state.results exist
  const hasResults = state && Array.isArray(state.results);
  const canLoadMore = hasResults && state.totalDocs > state.results.length;

  if (canLoadMore) {
    return (
      <button
        className="text-dark-grey py-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
        onClick={() => fetchDataFun({ page: state.page + 1 })}
      >
        Load More
      </button>
    );
  }

  return null; // Render nothing if there are no more results to load
};

LoadMoreData.propTypes = {
  state: PropTypes.shape({
    totalDocs: PropTypes.number.isRequired,
    results: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
  }),
  fetchDataFun: PropTypes.func.isRequired,
};

export default LoadMoreData;
