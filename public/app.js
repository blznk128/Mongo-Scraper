function saveThis(){
  $(".table-striped").on("click",".save", function(){
    var currentRow=$(this).closest("tr");
    var rowOne = currentRow.find("td:eq(0)").text();
    var rowTwo = currentRow.find("td:eq(1)").text();

    $.ajax({
      method:"POST",
      url:"/api/save",
      data: { title:rowOne, summary:rowTwo }
    }).done(function(data){

    });
  });
}

function deleteArticle(){
  $(".table-striped").on("click", ".delete", function() {
      console.log($(this).parent("td"));
      var rowId = $(this).parent("td").parent("tr").attr('id');
      $(this).closest("tr").remove();
      $.ajax({
        method:"DELETE",
        url:"/api/article/" + rowId
      }).done(function(data){
      });
  });
}

function deleteNotes(){
  $(".deleteComment").on("click", function() {
      console.log($(this).parent("td"));
      var rowId = $(this).parent("td").parent("tr").attr('id');
      $(this).closest("tr").remove();
      $.ajax({
        method:"DELETE",
        url:"/comment/" + rowId
      }).done(function(data){
      });
  });
}

$(document).ready(function(){
  $("#scrape").on("click",function(){
    $("tbody").empty();
    $.ajax({
      method:"GET",
      url:"/scrape"
    }).done(function(data){
      console.log(data);
      $("#headings").html("<h1>Scraped Articles</h1>");
      for(var i=0; i < data.length; i++){
        $("#nyt-articles").append(
        "<tbody><tr><td>" +data[i].title+"</td>"+
                "<td>" + data[i].summary+"</td>"+
                "<td><button class='btn btn-success save'> Save Article </button></td></tr></tbody>"
        );
      }
      saveThis();
    });
  });

  $("#home").on("click", function(event){
    event.preventDefault();
    window.location ="/articles";
  });

  $("#savedArticles").on("click", function(event){
    event.preventDefault();
    $.ajax({
      method:"GET",
      url:"/articles"
    }).done(function(data){
      console.log(data);
      $("#page-title1").html("Saved");
      $("#headings").html("<h1>Saved Articles</h1>");
      $("tbody").empty();

      for(var i=0; i < data.length; i++){
        $("#nyt-articles").append(
        "<tbody><tr id ="+ data[i]._id+" ><td>" +data[i].title+"</td>"+
                "<td>" + data[i].summary+"</td>"+
                "<td><button class='btn btn-success articleComments' data-toggle='modal' data-target='#comment' data-id="+data[i]._id+" >Article Notes</button></td><td><button class='btn btn-danger delete'>Delete Article</button></td></tr></tbody>"
        );
      }
      deleteArticle();
    });

  });


  $('#comment').on('show.bs.modal', function(e) {
    var articleId = $(e.relatedTarget).data('id');
    $("#comment").attr("data-article-id",articleId);
    $.ajax({
      method:"GET",
      url:"/articles/"+articleId,
    }).done(function(data){
      console.log(data);
      for(var i=0; i<data.comment.length; i++){
        console.log(data.comment.length);
        $(".comment_list").append(
          "<tbody><tr id="+data.comment[i]._id+"><td>&bull;  "+data.comment[i].body+"  <button class='btn btn-danger deleteComment'>X</button>"
        );
      }
      deleteNotes();
    })

    $(".saveComments").on("click", function(event){
      event.preventDefault
      var modalId = $("#comment").attr("data-article-id");
      $.ajax({
        method:"POST",
        url:"/api/new_comment/"+ modalId,
        data:{
          body:$("#myTextArea").val()
        }
      }).done(function(data){
        alert("comment saved");
      });
    });
  });
});