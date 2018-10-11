import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import WorkIcon from '@material-ui/icons/PermIdentity';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';

import { connect } from 'react-redux';

import styles from './mycom/styles4List';

class Listview extends React.Component {
  render() {
    const { classes, users } = this.props;
    return (
      <div className={classes.root}>
        <Typography variant="title" gutterBottom align="center">
          User List
        </Typography>
        <List className={classes.list}>
              {
                  users.map((row, inx) => (
                      <ListItem button key={inx}>
                        <Avatar className={classes.Avata}>
                          { row.photourl 
						                  ? <img src={row.photourl} alt="Profile" className={classes.Image}/>
                              : <WorkIcon/>
                          }
                        </Avatar>
                        <ListItemText primary={row.usernm} />
                          
                        <ListItemSecondaryAction className={classes.ListItemSecondaryAction}>
                          <ListItemText primary={row.usermsg}/>
                        </ListItemSecondaryAction>          
                      </ListItem>
                  ))
              }          
        </List>
      </div>
    );
  }
}

Listview.propTypes = {
  classes: PropTypes.object.isRequired,
};

let mapStateToProps = (state) => {
  return {
    users: state.users,
  };
}

export default connect(mapStateToProps)(withStyles(styles)(Listview));
