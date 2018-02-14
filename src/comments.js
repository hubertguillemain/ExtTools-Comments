const {
  Comment,
  Input,
  Button,
  Divider,
  Icon,
  TextArea,
  Form,
  Loader,
  Segment
} = semanticUIReact;

// TODO items
// - Manage error cases
// - Window sizing at initiation is incorrect
// - Delete button on comments - only for comments send by the currentuser
// - Reply button and threaded comments on comments
// - Only show the last X comments (4 by default) and button to expand the rest
// - Set extra fields "Last comment" and "Last comment by", so that OMIS plugins (email, script, ...) can act upon it.
// TODO Do not reset state too early

// TODO items which need some new SDK features
// - Display user name and avatar from database - remove hardcoded user ID from default state
// - Avatar / user name clickable to send flashnote


// NOTE that the variables comments_field_ID are already read from config/config.js via the index.html

//Initiate the OpenMedia plugin libraries
const WpLib = OMWebPluginLib;
const OMApi = OMWebPluginLib.OMApi;
const builder = WpLib.Plugin.SamePageBuilder.create(); //.onNotify(onClientNotify)
const plugin = WpLib.Plugin.createPlugin(builder);
const api = plugin.getApi();

class CommentsSection extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnInput = this.handleOnInput.bind(this);
    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.getUserName = this.getUserName.bind(this);
    this.getUserAvatar = this.getUserAvatar.bind(this);
	this.handleDelete = this.handleDelete.bind(this);
    this.state = {
      //Note that docID is a JSON object
      docID: null,
	  //TODO: remove hardcoded value
	  userID: 10007,
      isLoading: true,
	  toDelete: null,
      textAreaValue: "",
      comments: {
        total: 0,
        commentshistory: []
      }
    };
  }

  componentDidMount() {
    
	//TODO: get userID from api
	//Initialize state
    api.getCurrentDocumentId().then((docID) => {
      //place docID object in state so that we can reuse it later
      this.setState({
        docID: docID
      });

      //Load the comments from DB to state
      api
        .getFields(this.state.docID, [{ id: comments_field_ID }])
        .then((fields) => {
          if (JSON.stringify(fields[0].value) != "null") {
            this.setState({
              comments: JSON.parse(fields[0].value)
            });
          }

          //Update the window height
          //TODO: preventively update the windo height before !
          postContentSize(60);
        });
    });
  }

  handleAddComment(e) {
    //By safety we reload comments from client, in case another user has added a comment since the last reload
    api
      .getFields(this.state.docID, [{ id: comments_field_ID }])
      .then((fields) => {

        var today = new Date();
        var newCommentList = JSON.parse(fields[0].value);
        var newComment = {
          user: "10007",
          timestamp: today.getTime(),
          text: this.state.textAreaValue
        };

        //Update comments history and empty textArea
        newCommentList.commentshistory.push(newComment);
        newCommentList.total += 1;
        

        var fieldsToSet = [
          OMApi.stringField(
            JSON.stringify(newCommentList),
            comments_field_ID
          )
        ];
        api.setFields(this.state.docID, fieldsToSet).then((setFieldAnswer) => {
          //console.log(setFieldAnswer);
        });
        //TODO: manage error

		this.setState({
          comments: newCommentList,
          textAreaValue: ""
        });
        //TODO: move the window resize to top of method, with management of the promise
        postContentSize(60);

        //put the focus back to the textAreaValue
        document.getElementById("textArea").focus();
      });
  }

  handleCancel(e) {
    this.setState({
      textAreaValue: ""
    });
  }

  handleOnInput(e, { value }) {
    this.setState({
      textAreaValue: value
    });
  }
   handleDelete(key) {
   var newCommentList = null;
   
     //By safety we reload comments from client, in case another user has added a comment since the last reload
    api
      .getFields(this.state.docID, [{ id: comments_field_ID }])
 .then((fields) => {
	  newCommentList = JSON.parse(fields[0].value);
      newCommentList.commentshistory.splice(key, 1);	  
        newCommentList.total -= 1;
        this.setState({
          comments: newCommentList,
        });

        var fieldsToSet = [
          OMApi.stringField(
            JSON.stringify(this.state.comments),
            comments_field_ID
          )
        ];
        api.setFields(this.state.docID, fieldsToSet).then((setFieldAnswer) => {
          //console.log(setFieldAnswer);
        });
        //TODO: manage error

        //TODO: preventively update the required window height BEFORE the state is updated
        postContentSize(60);
      });
  }

  getUserName(userID) {		
    switch (userID) {
      case "10000":
        return "admin";
        break;
      case "10004":
        return "Jim Journalist";
        break;
      case "10005":
        return "Dan Director";
        break;
      case "10007":
        return "Pat Planner";
        break;
      case "10008":
        return "Martha Mixer";
        break;
      case "10009":
        return "car Camera";
        break;
      case "10010":
        return "Ralf Radio";
        break;
      case "10011":
        return "Olli Online";
        break;
      default:
        return userID;
    }
  }
  getUserAvatar(userID) {
    if (userID == "10000") {
      return "https://react.semantic-ui.com//assets/images/avatar/small/matt.jpg";
    }
    if (userID == "10002") {
      return "https://react.semantic-ui.com/assets/images/avatar/small/jenny.jpg";
    }
    //fallback: default image
    //TODO: store image in the src files
    return "./images/default_avatar.png";
  }

  render() {
    return (
      <Segment basic>
        {/*
            //TODO: Only show the last X comments
      
            <Divider horizontal>
                <Button content=" 16 older " />
              </Divider>
            */}

        <Comment.Group minimal>
          {this.state.comments.total == 0 ? (
            <div />
          ) : (
            this.state.comments.commentshistory.map((item, key) => (
              <Comment>
                <Comment.Avatar src={this.getUserAvatar(item.user)} />
                <Comment.Content>
                  <Comment.Author as="a">
				  
                    {(item.user == this.state.userID) ? "You" : this.getUserName(item.user)}
                  </Comment.Author>
                  <Comment.Metadata>
                    <span title={Date(item.timestamp)}>
                      {timeago().format(item.timestamp)}
                    </span>
                  </Comment.Metadata>
                  <Comment.Text>
                    {/*This function manages the line breaks in the JSON. Compatible with IE11*/}
                    {item.text.split(/\n/).map(function(item, key) {
                      return (
                        <span key={key}>
                          {item}
                          <br />
                        </span>
                      );
                    })}
                  </Comment.Text>
				   <Comment.Actions>
          <Comment.Action
		  onClick={(e,value) => {
		  
		  this.handleDelete(key);
		  }
		  } 
		  style={{display:(item.user == this.state.userID) ? "" : "none"}}
		  >Delete</Comment.Action>
        </Comment.Actions>
                  {/*
                         TODO: manage threaded comments
                         
                          */}
                </Comment.Content>
              </Comment>
            ))
          )}
        </Comment.Group>

        <Form reply>
          <Form.TextArea
            autoHeight
            placeholder="Write your comment here"
            onInput={this.handleOnInput}
            value={this.state.textAreaValue}
            id="textArea"
          />
         
            <Button
              onClick={this.handleAddComment}
              content="Add Comment"
              disabled={this.state.textAreaValue.length > 0 ? false : true}
              labelPosition="left"
              icon="edit"
              primary
            />
            <Button onClick={this.handleCancel} content="Cancel" />
         
        </Form>

      </Segment>
    );
  }
}

function postContentSize(offset) {
  // We add 30 pixels to avoid having a scrollbar flicker when the new comment appears
  const contentSize = {
    width: document.getElementById("root").scrollWidth,
    height: document.getElementById("root").scrollHeight + offset
  };

  plugin.postNotify(
    WpLib.Notify.View.Module,
    WpLib.Notify.View.ContentSize,
    contentSize
  );
}
