# TESTING

## Test-driven development

The TDD which is feasible on the projected modules is mostly on the Admin setup interface. The other two users, the interviewee and the interviewer, have relatively limited JavaScript interactivity, and will be mostly limited to unit testing.

### Integration tests

The most complex bundle of modules is the Admin interface. Its purpose is to generate the views including UI selection for the browsing by the interviewer. 

#### Admin interface

The Admin should be able to use this interface to set up the necessary information and the UI variables, as well as upload the assets needed for the presentation. After the presentation, the Admin should also be allowed to parse, save and analyse the information collected by the cookie regarding the browsing and interests of the interviewer.

##### Set up of interface parameters

Though the form to upload the information and assets is quite simple and straightforward, by creating a json file about the information related to the assets and allowing to upload these assets in the "content" folder, most of the testing for this feature will be behavioural.

However, several other features would benefit of TDD. Among others:

* Single page template selection
* Creating the UI themes for the presentation, including alternative themes and the accessible version of each theme.
* Connecting the selected UI parameters to the presentation
* Making alternative UI's available for a quick change by the interviewee, if needed.
* Connecting and ordering the assets with the information to each view.
* Selecting the pertinent views for the presentation and setting their hierarchy.

##### Cookie parsing

The information collected by the cookie will need to be tested to understand if the data parsed will be univocal enough to be used in a relational database. 

##### Remote management

The remote management allowing both the Admin and the Interviewee to adjust the UI to eventual change of circumstances should be tested to understand if the device used is capable of overriding any cachéed information loaded in memory.

#### Global interface

##### Interviewee launch screen

##### End-user interface

###### Cookies and breadcrumbs

###### Accessibility interface

###### E-mail collection

### Unit testing

## Behaviour-driven development

