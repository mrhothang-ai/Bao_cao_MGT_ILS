/************************************************************************
 * IL-SUNGTECH-MGT-DATA — Apps Script backend cho báo cáo MGT-001
 * Gắn vào Google Sheet cùng tên. Deploy: Deploy > New deployment >
 * Web app > Execute as: Me > Who has access: Anyone > lấy URL /exec,
 * dán vào CONFIG.POST_URL (nhập liệu) và GET_URL (dashboard) ở file HTML.
 *
 * Nguyên tắc: chỉ lưu số THÔ ở mức Part × Nhóm × NGÀY (sheet NL_NGAY).
 * Tuần/Tháng/Năm và rollup team/nhà máy do doGet tính khi đọc.
 ************************************************************************/

var SS = SpreadsheetApp.getActiveSpreadsheet();

/* ===== Ghi số (nhận từ form Nhập liệu, mode no-cors) ===== */
function doPost(e){
  try{
    var body = JSON.parse(e.postData.contents);
    if(body.type === "NL_NGAY") return upsertNL(body);
    if(body.type === "KPI_TUAN") return upsertKPI(body);
    return json_({ok:false, msg:"type không hợp lệ"});
  }catch(err){ return json_({ok:false, msg:String(err)}); }
}

/* Ghi đè theo khóa Ngày+Part+Nhóm */
function upsertNL(body){
  var sh = sheet_("NL_NGAY", ["ngay","tuan","part","nhom","tong","dilam","nguoi_nhap","ts"]);
  var data = sh.getDataRange().getValues();           // gồm header
  var idx = {};                                        // key -> rowIndex (1-based trong sheet)
  for(var r=1;r<data.length;r++){ idx[data[r][0]+"|"+data[r][2]+"|"+data[r][3]] = r+1; }
  var tuan = isoWeek_(body.date);
  var now = new Date();
  (body.records||[]).forEach(function(rec){
    var key = rec.date+"|"+rec.part+"|"+rec.group;
    var row = [rec.date, tuan, rec.part, rec.group, rec.tong, rec.dilam, body.nguoi||"HR", now];
    if(idx[key]) sh.getRange(idx[key],1,1,row.length).setValues([row]);  // ghi đè
    else sh.appendRow(row);
  });
  return json_({ok:true, n:(body.records||[]).length, tuan:tuan});
}

function upsertKPI(body){
  var sh = sheet_("KPI_TUAN", ["tuan","part","ma_kpi","gia_tri","nguoi_nhap","ts"]);
  var data = sh.getDataRange().getValues(), idx={};
  for(var r=1;r<data.length;r++){ idx[data[r][0]+"|"+data[r][1]+"|"+data[r][2]] = r+1; }
  var now=new Date();
  (body.records||[]).forEach(function(rec){
    var key=rec.tuan+"|"+rec.part+"|"+rec.ma_kpi;
    var row=[rec.tuan, rec.part, rec.ma_kpi, rec.gia_tri, body.nguoi||"", now];
    if(idx[key]) sh.getRange(idx[key],1,1,row.length).setValues([row]); else sh.appendRow(row);
  });
  return json_({ok:true, n:(body.records||[]).length});
}

/* ===== Đọc & tổng hợp (dashboard gọi) ===== */
function doGet(e){
  var sh = sheet_("NL_NGAY", ["ngay","tuan","part","nhom","tong","dilam","nguoi_nhap","ts"]);
  var data = sh.getDataRange().getValues();
  // gom theo tuan -> part -> nhom : cộng dồn tong & dilam của các NGÀY trong tuần
  var agg = {};   // agg[tuan][part][nhom] = {tong, dilam}
  for(var r=1;r<data.length;r++){
    var tuan=data[r][1], part=data[r][2], nhom=data[r][3], tong=Number(data[r][4])||0, di=Number(data[r][5])||0;
    if(!tuan) continue;
    agg[tuan]=agg[tuan]||{}; agg[tuan][part]=agg[tuan][part]||{};
    var g=agg[tuan][part][nhom]=agg[tuan][part][nhom]||{tong:0,dilam:0};
    g.tong+=tong; g.dilam+=di;
  }
  // KPI
  var ksh=sheet_("KPI_TUAN",["tuan","part","ma_kpi","gia_tri","nguoi_nhap","ts"]);
  var kd=ksh.getDataRange().getValues(), kpi={};
  for(var r=1;r<kd.length;r++){ var t=kd[r][0],p=kd[r][1],m=kd[r][2]; kpi[t]=kpi[t]||{}; kpi[t][p]=kpi[t][p]||{}; kpi[t][p][m]=kd[r][3]; }
  return json_({ok:true, nl:agg, kpi:kpi, updated:new Date()});
}

/* ===== Tiện ích ===== */
function sheet_(name, headers){
  var sh = SS.getSheetByName(name);
  if(!sh){ sh = SS.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); }
  return sh;
}
// Tuần ISO dạng "W38" (khớp nhãn tuần trên báo cáo)
function isoWeek_(dstr){
  var d=new Date(dstr); d.setHours(0,0,0,0);
  d.setDate(d.getDate()+3-((d.getDay()+6)%7));
  var wk1=new Date(d.getFullYear(),0,4);
  var n=1+Math.round(((d-wk1)/86400000-3+((wk1.getDay()+6)%7))/7);
  return "W"+n;
}
function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
