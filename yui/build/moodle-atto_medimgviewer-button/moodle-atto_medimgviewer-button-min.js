YUI.add("moodle-atto_medimgviewer-button",function(e,t){var n="atto_medimgviewer",r={},i="atto_medimgviewer",s={},o={BROWSER:"height: 600px; width: 600px; overflow: auto; padding: 5px;",CONTROLS:"wdith: 100px; padding: 10px; float: left;",LINK:"cursor: pointer; color: #1177d1;",PATH:"width: 500px; padding: 10px; border: 1px solid rgba(0, 0, 0, .125); margin-bottom: 10px; white-space: nowrap; overflow-x: hidden; text-overflow: ellipsis; float: left;",PLACEHOLDER:"font-style: italic; opacity: 0.75;"},u='{{#if showFilepicker}}<div id="medimg-viewer-editor"><div id="medimg-viewer-editor-path"><div id="medimg-viewer-editor-path-display" style="'+o.PATH+'">'+'<span style="'+o.PLACEHOLDER+'">{{get_string "dialog:select_file" component}}</span>'+"</div>"+'<div id="medimg-viewer-editor-path-controls" style="'+o.CONTROLS+'">'+'<span id="medimg-viewer-editor-copy" style="'+o.LINK+'">{{get_string "dialog:copy" component}}</span> / '+'<span id="medimg-viewer-editor-insert" style="'+o.LINK+'">{{get_string "dialog:insert" component}}</span>'+"</div>"+"</div>"+'<textarea id="medimg-viewer-editor-path-copy" style="display:none"></textarea>'+'<div id="medimg-viewer-editor-file-browser" style="'+o.BROWSER+'" data-path="/">{{get_string "dialog:loading" component}}</div>'+"</div>"+"{{/if}}";e.namespace("M.atto_medimgviewer").Button=e.Base.create("button",e.M.editor_atto.EditorPlugin,[],{_currentSelection:null,_content:null,initializer:function(){if(this.get("disabled"))return;var e=this.get("host"),t=this.get("area"),n=e.get("filepickeroptions");if(!t||!t.filtertag)return;if(!n.image||!n.image.itemid)return;t.itemid=n.image.itemid,this.addButton({icon:"icon-final",iconComponent:"atto_medimgviewer",callback:this._displayBrowser})},_buildFileTree:function(){var t=e.mix(this.get("area"),{what:"filetree"}),n=M.cfg.wwwroot+"/lib/editor/atto/plugins/medimgviewer/api.php?"+e.QueryString.stringify(t);fetch(n).then(function(e){return console.log(e),e.json()}).then(function(e){var t=document.getElementById("medimg-viewer-editor-file-browser"),n=document.getElementById("medimg-viewer-editor-path-copy"),r=document.getElementById("medimg-viewer-editor-path-display");if($.isEmptyObject(e.subdirs)&&!e.files.length){t.innerText=M.util.get_string("medimgviewer","dialog:no_files");return}t.innerText="";var i=function(e,s,o){if(!e)return;var u,a,f,l,c,h,p,d=function(e,t){for(var n=0;n<t;n++)p=document.createElement("span"),p.style.display="inline-block",p.style.width="calc(16px + 0.5rem)",e.appendChild(p)},v=function(e){var t;document.querySelector("#medimg-viewer-editor-file-browser").childNodes.forEach(function(n){if(n.dataset.path&&n.dataset.path===e){parseInt(n.dataset.open)?t=!0:t=!1,n.dataset.open=t?0:1;return}}),document.querySelector("#medimg-viewer-editor-file-browser").childNodes.forEach(function(n){if(n.dataset.path){const r=n.dataset.path;r.startsWith(e)&&r.length>e.length&&(r.substring(e.length,r.length-1).indexOf("/")===-1?t?(n.style.height="0",n.dataset.open!==undefined&&(n.dataset.open=0)):n.style.height="1.5em":t&&(n.style.height="0"))}})};for(u in e.files){const m=o+u;f=document.createElement("div"),f.style.height=s?"0":"1.5em",f.style.lineHeight="1.5em",f.style.cursor="pointer",f.style.overflow="hidden",f.dataset.path=m,f.onclick=function(){r.innerText=m,n.value=m},d(f,s),h=document.createElement("i"),h.className="icon fa fa-file-o fa-fw",f.appendChild(h),c=document.createElement("span"),c.innerText=u,f.appendChild(c),t.appendChild(f)}for(a in e.subdirs){l=e.subdirs[a];const g=o+a+"/";f=document.createElement("div"),f.style.height=s?"0":"1.5em",f.style.lineHeight="1.5em",f.style.cursor="pointer",f.style.overflow="hidden",f.dataset.path=g,f.dataset.open=0,f.onclick=function(){r.innerText=g,n.value=g},f.ondblclick=function(){v(g)},d(f,s),h=document.createElement("i"),h.className="icon fa fa-folder fa-fw",h.style.color="#1177d1",f.appendChild(h),c=document.createElement("span"),c.style.userSelect="none",c.innerText=a,f.appendChild(c),t.appendChild(f),i(l,s+1,g)}};i(e,0,"/")})},_copyPathToClipboard:function(e){var t=document.getElementById("medimg-viewer-editor-path-copy"),n=this.get("area");if(!t.value){console.warn("Path is empty, nothing to copy.");return}const r=M.cfg.wwwroot+"/draftfile.php/"+n.usercontextid+"/user/draft/"+n.itemid+t.value+":"+n.filtertag;if(navigator.clipboard){navigator.clipboard.writeText(r).then(function(){console.log("Path copied to clipboard.")},function(e){console.error("Copying path to clipboard failed!",e)});return}const i=t.value;t.value=r,t.focus(),t.select();try{var s=document.execCommand("copy");s?console.log("Path copied to clipboard."):console.error("Copying path to clipboard failed!")}catch(o){console.error("Copying path to clipboard failed!",o)}t.value=i,t.blur()},_displayBrowser:function(e){e.preventDefault(),this._currentSelection=this.get("host").getSelection();if(this._currentSelection===!1)return;var t=this.getDialogue({headerContent:M.util.get_string("medimgviewer",i),width:"auto",focusAfterHide:!0});t.set("bodyContent",this._getDialogueContent()),this._resolveAnchors(),t.show(),this._buildFileTree()},_getDialogueContent:function(){var t=e.Handlebars.compile(u),i=this.get("host").canShowFilepicker("link"),s;return s=t({showFilepicker:i,component:n,CSS:r,filetree:this.get("filetree"),itemid:this.get("itemid")}),this._content=e.Node.create(s),this._content.one("#medimg-viewer-editor-copy").on("click",this._copyPathToClipboard,this),this._content.one("#medimg-viewer-editor-insert").on("click",this._setLinkOnSelection,this),this._content},_resolveAnchors:function(){var t=this.get("host").getSelectionParentNode(),n,r,i;if(!t)return;n=this._findSelectedAnchors(e.one(t)),n.length>0&&(r=n[0],this._currentSelection=this.get("host").getSelectionFromNode(r),i=r.getAttribute("href"),i!==""&&(this._content.one("#medimg-viewer-editor-path-display").innerText=i))},_setLinkOnSelection:function(){var t=this.get("host"),n=this.get("area"),r=M.cfg.wwwroot+"/draftfile.php/"+n.usercontextid+"/user/draft/"+
n.itemid+document.getElementById("medimg-viewer-editor-path-display").innerText+":"+n.filtertag,i,s,o;this.editor.focus(),t.setSelection(this._currentSelection),this._currentSelection[0].collapsed?(i=e.Node.create("<a>"+r+"</a>"),i.setAttribute("href",r),s=t.insertContentAtFocusPoint(i.get("outerHTML")),t.setSelection(t.getSelectionFromNode(s))):(document.execCommand("unlink",!1,null),document.execCommand("createLink",!1,r),s=t.getSelectionParentNode());if(!s)return;return o=this._findSelectedAnchors(e.one(s)),s},_findSelectedAnchors:function(e){var t=e.get("tagName"),n,r;return t&&t.toLowerCase()==="a"?[e]:(r=[],e.all("a").each(function(e){!n&&this.get("host").selectionContainsNode(e)&&r.push(e)},this),r.length>0?r:(n=e.ancestor("a"),n?[n]:[]))}},{ATTRS:{area:{value:{}},disabled:{value:!1},usercontext:{value:null}}})},"@VERSION@",{requires:["moodle-editor_atto-plugin"]});
