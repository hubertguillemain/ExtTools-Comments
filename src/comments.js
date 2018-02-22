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

//Version of this module
const module_version = 1;

class CommentsSection extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnInput = this.handleOnInput.bind(this);
    this.handleAddComment = this.handleAddComment.bind(this);
    this.getUserName = this.getUserName.bind(this);
    this.getUserAvatar = this.getUserAvatar.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
	 this.handleShowAll = this.handleShowAll.bind(this);
	
	 
    this.state = {
      //Note that docID is a JSON object
      docID: null,
      //TODO: remove hardcoded value
      userID: 10007,
	  number_to_show: number_of_displayed_comments,
      textAreaValue: "",
      comments: {
        total: 0,
        version: module_version,
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
            //TODO: manage versionning
            //TODO: manage old non-JSON content
            this.setState({
              comments: JSON.parse(fields[0].value)
            });
          }

          //Update the window height
          postContentSize();
        });
    });
  }
 
 componentDidUpdate(){
 postContentSize();
 }

  handleAddComment(e) {
  // start by reading again comments from database, in case another user made an update since the last read.
     api
      .getFields(this.state.docID, [{ id: comments_field_ID }])
      .then((fields) => {
	  console.log(fields);
	     if (JSON.stringify(fields[0].value) != "null") {
             var newCommentList = JSON.parse(fields[0].value);
          }else{
		  var newCommentList = this.state.comments;
		  }
		  console.log(newCommentList);
        var today = new Date();
        var newComment = {
          user: "10007",
          timestamp: today.getTime(),
          text: this.state.textAreaValue
        };

        //Update comments history and empty textArea
        newCommentList.commentshistory.unshift(newComment);
		console.log(newCommentList);
        newCommentList.total += 1;
		newCommentList.version = module_version;

        var fieldsToSet = [
          OMApi.stringField(JSON.stringify(newCommentList), comments_field_ID)
        ];
        api.setFields(this.state.docID, fieldsToSet).then((setFieldAnswer) => {
          //console.log(setFieldAnswer);
        });
        //TODO: manage error

        this.setState({
          comments: newCommentList,
          textAreaValue: ""
        });
        //put the focus back to the textAreaValue
        document.getElementById("textArea").focus();
      });
  }

  handleOnInput(e, { value }) {
    this.setState({
      textAreaValue: value
    });
  }
  handleShowAll(e, { value }) {
 
    this.setState({
      number_to_show: this.state.total,
    }
	);
  }
  
  
  
  handleDelete(key) {
    //
    var newCommentList = null;

    //By safety we reload comments from client, in case another user has added a comment since the last reload
    api
      .getFields(this.state.docID, [{ id: comments_field_ID }])
      .then((fields) => {
        newCommentList = JSON.parse(fields[0].value);
        newCommentList.commentshistory.splice(key, 1);
        newCommentList.total -= 1;
        this.setState({
          comments: newCommentList
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end"
          }}
        >
          <div style={{ flex: "1" }}>
            <Form reply>
              <Form.TextArea
                autoHeight
                rows={1}
                placeholder="Write your comment here"
                onInput={this.handleOnInput}
                value={this.state.textAreaValue}
                id="textArea"
              />
            </Form>
          </div>

          <div style={{ flex: "0", marginLeft: "10px" }}>
            <Button
              onClick={this.handleAddComment}
              disabled={this.state.textAreaValue.length > 0 ? false : true}
              content="Add"
              primary
            />
		
          </div>
        </div>
        <Comment.Group>
          {this.state.comments.total == 0 ? (
            <div />
          ) : (
		  
		  
            this.state.comments.commentshistory.slice(0, this.state.number_to_show).map((item, key) => (
              <Comment>
                <Comment.Avatar src={this.getUserAvatar(item.user)} />
                <Comment.Content>
                  <Comment.Author as="a">
                    {item.user == this.state.userID
                      ? "You"
                      : this.getUserName(item.user)}
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
                      onClick={(e, value) => {
                        this.handleDelete(key);
                      }}
                      style={{
                        display: item.user == this.state.userID ? "" : "none"
                      }}
                    >
                      Delete
                    </Comment.Action>
                  </Comment.Actions>
                </Comment.Content>
              </Comment>
            ))
          )}
        </Comment.Group>
		
		 {this.state.comments.total > this.state.number_to_show ? (
           <Divider horizontal clearing>
		<Button onClick={this.handleShowAll}>
		Show {this.state.comments.total - this.state.number_to_show} older
		</Button>
		</Divider>

          ) : (
		  
		  <div/>
		  )
		  }

		
      </Segment>
    );
  }
}

function postContentSize() {
     const contentSize: WpLib.Notify.View.ContentSizeData = {
          width: document.getElementById("root").scrollWidth,
          height: document.getElementById("root").scrollHeight
		 
     }
     plugin.postNotify(WpLib.Notify.View.Module, WpLib.Notify.View.ContentSize, contentSize)
}

