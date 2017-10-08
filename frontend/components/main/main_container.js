import { connect } from 'react-redux';
import Main from './main';

import { receiveQuery } from '../../actions/query_actions';

const mapStateToProps = state => {
  return {
    query: state.query,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    receiveQuery: () => dispatch(receiveQuery()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
