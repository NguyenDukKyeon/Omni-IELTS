export const CURATED_LEXICAL_SETS=Object.freeze([
  {
    id:'ielts-set-trends',name:'Trends & Change',description:'Mô tả xu hướng, mức độ và điểm chuyển trong Academic Writing Task 1 hoặc thảo luận dữ liệu.',level:'B1–C1',functions:['describe trends','quantify change','identify turning points'],register:'formal/neutral',productionTask:'Viết 3 câu mô tả một chỉ số tăng, ổn định rồi giảm. Dùng ít nhất 3 mục trong set và tránh lặp động từ.',commonMistakes:['Dùng “increase dramatically” cho thay đổi rất nhỏ.','Nhầm “reach a peak” với “remain at a peak”.','Dùng “fluctuate” khi dữ liệu chỉ thay đổi một chiều.'],status:'active',
    suggestedEntries:[
      {term:'experience a gradual decline',meaning:'trải qua sự suy giảm dần dần',function:'describe downward trend',register:'formal',context:'The proportion experienced a gradual decline over the following decade.',commonMistake:'Không dùng với một biến động giảm đột ngột.',productionPrompt:'Mô tả một chỉ số giảm chậm trong ít nhất ba năm.'},
      {term:'remain relatively stable',meaning:'duy trì tương đối ổn định',function:'describe stability',register:'neutral/formal',context:'Household spending remained relatively stable between 2015 and 2018.',commonMistake:'“Stable” không có nghĩa là hoàn toàn không thay đổi.',productionPrompt:'So sánh một chỉ số ổn định với một chỉ số biến động.'},
      {term:'reach a peak of',meaning:'đạt đỉnh ở mức',function:'identify maximum',register:'neutral/formal',context:'The figure reached a peak of 72% in 2022.',commonMistake:'Phải theo sau bằng một giá trị hoặc mốc được xác định rõ.',productionPrompt:'Viết một câu nêu thời điểm và giá trị cao nhất.'},
      {term:'fluctuate considerably',meaning:'dao động đáng kể',function:'describe irregular movement',register:'formal',context:'Oil prices fluctuated considerably throughout the period.',commonMistake:'Không dùng cho xu hướng tăng đều.',productionPrompt:'Mô tả một chuỗi dữ liệu lên xuống nhiều lần.'},
      {term:'show a marginal increase',meaning:'cho thấy mức tăng nhẹ',function:'quantify small change',register:'formal',context:'The final quarter showed a marginal increase in demand.',commonMistake:'“Marginal” không phù hợp với thay đổi lớn.',productionPrompt:'Diễn đạt mức tăng nhỏ mà không dùng “slightly”.'},
      {term:'a sharp upward trend',meaning:'một xu hướng tăng mạnh',function:'summarize direction and degree',register:'formal',context:'Online enrolment followed a sharp upward trend after 2020.',commonMistake:'Không dùng khi chỉ có hai điểm dữ liệu gần nhau.',productionPrompt:'Viết overview cho một biểu đồ có xu hướng tăng rõ.'}
    ]
  },
  {
    id:'ielts-set-comparison',name:'Comparison & Contrast',description:'So sánh nhóm, thời kỳ và mức độ mà không chỉ lặp “higher/lower”.',level:'B1–C1',functions:['compare magnitude','contrast groups','qualify similarity'],register:'neutral/formal',productionTask:'Viết một đoạn 80–100 từ so sánh hai nhóm. Dùng ít nhất một cấu trúc tương đồng và hai cấu trúc tương phản.',commonMistakes:['Nhầm “twice as high as” với “two times higher than”.','Dùng “whereas” nhưng không tạo hai mệnh đề hoàn chỉnh.','Dùng “comparable” khi chênh lệch còn rất lớn.'],status:'active',
    suggestedEntries:[
      {term:'by comparison',meaning:'khi so sánh',function:'introduce contrast',register:'formal',context:'By comparison, rural households spent far less on transport.',commonMistake:'Không dùng như liên từ nối trực tiếp hai mệnh đề.',productionPrompt:'Đặt câu thứ hai đối chiếu với một dữ kiện trước đó.'},
      {term:'roughly twice as high as',meaning:'cao xấp xỉ gấp đôi',function:'compare ratio',register:'neutral/formal',context:'The urban rate was roughly twice as high as the rural rate.',commonMistake:'Sau “as high as” cần đối tượng so sánh rõ ràng.',productionPrompt:'So sánh hai tỷ lệ gần theo quan hệ 2:1.'},
      {term:'a comparable proportion',meaning:'một tỷ lệ tương đương',function:'express similarity',register:'formal',context:'A comparable proportion of both groups preferred online study.',commonMistake:'Chỉ dùng khi mức chênh không làm thay đổi kết luận.',productionPrompt:'Nêu điểm giống nhau giữa hai nhóm.'},
      {term:'in marked contrast to',meaning:'trái ngược rõ rệt với',function:'strong contrast',register:'formal',context:'In marked contrast to adults, teenagers reported higher daily usage.',commonMistake:'Không dùng cho khác biệt nhỏ.',productionPrompt:'Nhấn mạnh một khác biệt nổi bật.'},
      {term:'whereas',meaning:'trong khi/trái lại',function:'contrast two clauses',register:'neutral/formal',context:'The first group prioritised cost, whereas the second valued convenience.',commonMistake:'Hai vế đều phải là mệnh đề có chủ ngữ và động từ.',productionPrompt:'Viết một câu đối chiếu hai ưu tiên.'},
      {term:'the gap narrowed',meaning:'khoảng cách thu hẹp',function:'compare change over time',register:'formal',context:'The gap narrowed substantially during the final three years.',commonMistake:'Phải xác định khoảng cách giữa hai đại lượng nào.',productionPrompt:'Mô tả hai đường dữ liệu tiến gần nhau.'}
    ]
  },
  {
    id:'ielts-set-cause',name:'Cause & Consequence',description:'Giải thích nguyên nhân, cơ chế và hệ quả với mức độ chắc chắn phù hợp.',level:'B2–C1',functions:['state cause','explain mechanism','describe consequence','qualify causality'],register:'formal/academic',productionTask:'Viết một đoạn giải thích một vấn đề xã hội theo chuỗi nguyên nhân → cơ chế → hệ quả. Dùng ít nhất 3 mục.',commonMistakes:['Khẳng định quan hệ nhân quả khi chỉ có tương quan.','Dùng “result from” và “result in” ngược chiều.','Lạm dụng “because of” cho mọi quan hệ.'],status:'active',
    suggestedEntries:[
      {term:'can be attributed to',meaning:'có thể được quy cho',function:'state a qualified cause',register:'academic',context:'The decline can partly be attributed to improved public transport.',commonMistake:'Không nên dùng khi nguyên nhân chưa có bằng chứng hợp lý.',productionPrompt:'Nêu một nguyên nhân với mức độ thận trọng.'},
      {term:'give rise to',meaning:'dẫn đến, làm phát sinh',function:'describe consequence',register:'formal',context:'Poor planning can give rise to avoidable congestion.',commonMistake:'Chủ ngữ phải là yếu tố tạo ra hệ quả.',productionPrompt:'Nêu một hệ quả gián tiếp của một chính sách.'},
      {term:'stem from',meaning:'bắt nguồn từ',function:'trace origin',register:'formal',context:'Many of these difficulties stem from unequal access to training.',commonMistake:'Không dùng như “stem to”.',productionPrompt:'Giải thích nguồn gốc sâu xa của một vấn đề.'},
      {term:'create a feedback loop',meaning:'tạo vòng phản hồi',function:'explain mechanism',register:'academic',context:'Low confidence and limited participation can create a negative feedback loop.',commonMistake:'Cần giải thích vòng lặp vận hành thế nào.',productionPrompt:'Mô tả hai yếu tố củng cố lẫn nhau.'},
      {term:'a plausible explanation is that',meaning:'một lời giải thích hợp lý là',function:'offer cautious explanation',register:'academic',context:'A plausible explanation is that flexible schedules reduce commuting pressure.',commonMistake:'Không coi đây là bằng chứng kết luận.',productionPrompt:'Đưa ra giả thuyết cho một xu hướng quan sát được.'},
      {term:'have far-reaching consequences',meaning:'có những hệ quả sâu rộng',function:'emphasize long-term impact',register:'formal',context:'Persistent skills shortages may have far-reaching consequences for productivity.',commonMistake:'Không dùng cho tác động nhỏ và ngắn hạn.',productionPrompt:'Nêu hệ quả dài hạn của một vấn đề.'}
    ]
  },
  {
    id:'ielts-set-opinion',name:'Cautious Opinion & Evaluation',description:'Trình bày và đánh giá quan điểm mà không tuyệt đối hóa hoặc dùng cụm sáo rỗng.',level:'B2–C1',functions:['state position','qualify claim','evaluate evidence','concede limits'],register:'formal/academic',productionTask:'Viết một đoạn 90–120 từ nêu quan điểm có nhượng bộ. Dùng một claim thận trọng, một concession và một evaluation.',commonMistakes:['Dùng “it is undeniable” cho vấn đề còn tranh luận.','Lặp “I think” ở mọi câu.','Dùng hedge quá mức khiến lập trường không rõ.'],status:'active',
    suggestedEntries:[
      {term:'it could be argued that',meaning:'có thể lập luận rằng',function:'introduce a defensible claim',register:'formal',context:'It could be argued that remote work expands access to employment.',commonMistake:'Sau đó vẫn cần lý do hoặc bằng chứng.',productionPrompt:'Mở đầu một luận điểm có thể tranh luận.'},
      {term:'to a considerable extent',meaning:'ở một mức độ đáng kể',function:'qualify agreement',register:'formal',context:'This approach is effective to a considerable extent, although it is not universal.',commonMistake:'Không đồng nghĩa với hoàn toàn.',productionPrompt:'Đồng ý phần lớn nhưng giữ một giới hạn.'},
      {term:'the evidence remains inconclusive',meaning:'bằng chứng vẫn chưa đưa đến kết luận',function:'evaluate evidence',register:'academic',context:'The evidence remains inconclusive regarding long-term productivity gains.',commonMistake:'Không dùng khi đã có bằng chứng mạnh và nhất quán.',productionPrompt:'Đánh giá một vấn đề chưa đủ dữ liệu.'},
      {term:'a key limitation is that',meaning:'một hạn chế chính là',function:'identify limitation',register:'formal',context:'A key limitation is that the policy does not address regional inequality.',commonMistake:'Hạn chế phải liên quan trực tiếp đến luận điểm.',productionPrompt:'Nêu giới hạn quan trọng của một giải pháp.'},
      {term:'this view overlooks',meaning:'quan điểm này bỏ qua',function:'criticise reasoning',register:'formal',context:'This view overlooks the costs faced by low-income households.',commonMistake:'Cần nêu chính xác yếu tố bị bỏ qua.',productionPrompt:'Phản biện một quan điểm bằng một biến số bị thiếu.'},
      {term:'on balance',meaning:'xét tổng thể',function:'weigh competing considerations',register:'formal',context:'On balance, the benefits are likely to outweigh the short-term disruption.',commonMistake:'Nên xuất hiện sau khi đã cân nhắc ít nhất hai phía.',productionPrompt:'Kết luận sau một đoạn có cả lợi ích và hạn chế.'}
    ]
  },
  {
    id:'ielts-set-solutions',name:'Problems & Solutions',description:'Xác định vấn đề, đánh giá tính khả thi và mô tả tác động của giải pháp.',level:'B2–C1',functions:['define problem','propose intervention','assess feasibility','state outcome'],register:'formal',productionTask:'Viết một đoạn đề xuất giải pháp cho vấn đề đô thị. Giải thích ai thực hiện, cơ chế và giới hạn.',commonMistakes:['Nêu giải pháp quá chung chung như “raise awareness”.','Không giải thích cơ chế giải pháp tạo thay đổi.','Dùng “solve” cho biện pháp chỉ giảm nhẹ.'],status:'active',
    suggestedEntries:[
      {term:'address the underlying cause',meaning:'xử lý nguyên nhân gốc rễ',function:'define solution depth',register:'formal',context:'Long-term investment is needed to address the underlying cause of the shortage.',commonMistake:'Phải phân biệt nguyên nhân gốc với triệu chứng.',productionPrompt:'Giải thích một chính sách xử lý nguyên nhân chứ không chỉ triệu chứng.'},
      {term:'a targeted intervention',meaning:'một biện pháp can thiệp có mục tiêu',function:'propose focused solution',register:'formal/academic',context:'A targeted intervention would support households most at risk.',commonMistake:'Cần nêu nhóm mục tiêu cụ thể.',productionPrompt:'Đề xuất giải pháp cho một nhóm dễ bị ảnh hưởng.'},
      {term:'be financially viable',meaning:'khả thi về tài chính',function:'assess feasibility',register:'formal',context:'The scheme must be financially viable beyond the pilot stage.',commonMistake:'Không đồng nghĩa với chắc chắn có lợi nhuận.',productionPrompt:'Đánh giá chi phí dài hạn của một đề xuất.'},
      {term:'mitigate the impact of',meaning:'giảm nhẹ tác động của',function:'limit harm',register:'formal',context:'Flexible hours may mitigate the impact of peak-time congestion.',commonMistake:'“Mitigate” thường là giảm nhẹ, không loại bỏ hoàn toàn.',productionPrompt:'Nêu biện pháp làm giảm tác hại nhưng chưa giải quyết triệt để.'},
      {term:'implementation would require',meaning:'việc triển khai sẽ đòi hỏi',function:'state practical requirement',register:'formal',context:'Implementation would require sustained funding and staff training.',commonMistake:'Nên nêu nguồn lực hoặc điều kiện cụ thể.',productionPrompt:'Liệt kê hai điều kiện để một giải pháp hoạt động.'},
      {term:'produce measurable outcomes',meaning:'tạo ra kết quả có thể đo lường',function:'evaluate effectiveness',register:'formal',context:'The programme should produce measurable outcomes within two years.',commonMistake:'Cần chỉ rõ chỉ số hoặc khoảng thời gian.',productionPrompt:'Đề xuất cách đo hiệu quả của một giải pháp.'}
    ]
  },
  {
    id:'ielts-set-speaking',name:'Speaking Extension Chunks',description:'Mở rộng câu trả lời Speaking Part 1 và Part 3 tự nhiên, tránh học thuộc bài mẫu.',level:'B1–C1',functions:['give reason','add example','qualify frequency','develop abstract answer'],register:'spoken neutral',productionTask:'Trả lời một câu hỏi trong 45–60 giây. Dùng 3 chunks nhưng thay nội dung theo trải nghiệm thật của bạn.',commonMistakes:['Nhồi quá nhiều discourse markers.','Dùng cụm formal như văn viết trong Part 1.','Học nguyên câu mẫu không phù hợp câu hỏi.'],status:'active',
    suggestedEntries:[
      {term:'what I find most useful is',meaning:'điều tôi thấy hữu ích nhất là',function:'focus an answer',register:'spoken neutral',context:'What I find most useful is the ability to review lessons at my own pace.',commonMistake:'Cần theo sau bằng danh từ hoặc mệnh đề hoàn chỉnh.',productionPrompt:'Nêu lợi ích quan trọng nhất của một ứng dụng.'},
      {term:'one reason for that is',meaning:'một lý do cho điều đó là',function:'add reason',register:'spoken neutral',context:'One reason for that is that I can fit it around my schedule.',commonMistake:'Không cần lặp lại khi đã giải thích cùng một ý.',productionPrompt:'Mở rộng một câu trả lời bằng nguyên nhân cá nhân.'},
      {term:'a good example would be',meaning:'một ví dụ phù hợp là',function:'give example',register:'spoken neutral',context:'A good example would be the community library near my home.',commonMistake:'Ví dụ phải thực sự minh họa cho ý trước.',productionPrompt:'Đưa ví dụ cụ thể cho một nhận xét chung.'},
      {term:'it depends to some extent on',meaning:'điều đó phần nào phụ thuộc vào',function:'qualify generalisation',register:'spoken/formal neutral',context:'It depends to some extent on a person’s age and daily routine.',commonMistake:'Sau “on” cần danh từ/cụm danh từ.',productionPrompt:'Tránh trả lời tuyệt đối cho một câu hỏi Part 3.'},
      {term:'I tend to',meaning:'tôi thường có xu hướng',function:'describe usual behaviour',register:'spoken neutral',context:'I tend to study in short sessions during the week.',commonMistake:'Dùng cho thói quen, không phải một sự kiện đơn lẻ.',productionPrompt:'Mô tả thói quen học tập của bạn.'},
      {term:'in the longer term',meaning:'xét về dài hạn',function:'extend to future consequence',register:'spoken/formal neutral',context:'In the longer term, this could change how cities are designed.',commonMistake:'Không dùng khi chỉ nói hệ quả ngay lập tức.',productionPrompt:'Mở rộng câu trả lời Part 3 sang hệ quả tương lai.'}
    ]
  }
]);

export const CURATED_PARAPHRASE_ITEMS=Object.freeze([
  {
    id:'paraphrase-trend-1',kind:'paraphrase',prompt:'Lựa chọn nào giữ nguyên nghĩa của câu nguồn?',context:'The percentage of commuters using bicycles rose gradually over the decade.',status:'verified',sourceCardIds:[],provenance:{status:'verified',model:null,promptVersion:'curated-v1',generatedAt:0,verifiedAt:1,verifiedBy:'Vocab Master'},options:[
      {id:'a',text:'The share of people cycling to work increased steadily during the ten-year period.',correct:true,rationale:'Giữ nguyên đối tượng, hướng tăng, mức độ dần dần và khoảng thời gian.'},
      {id:'b',text:'Cycling became the most popular form of transport within ten years.',correct:false,rationale:'Thêm ý “phổ biến nhất” mà câu nguồn không cung cấp.'},
      {id:'c',text:'The number of bicycle commuters doubled every year.',correct:false,rationale:'Đổi percentage thành number và thêm mức tăng gấp đôi hằng năm.'}
    ]
  },
  {
    id:'paraphrase-cause-1',kind:'paraphrase',prompt:'Lựa chọn nào diễn đạt đúng quan hệ nguyên nhân?',context:'Limited access to training is a major factor behind the persistent skills shortage.',status:'verified',sourceCardIds:[],provenance:{status:'verified',model:null,promptVersion:'curated-v1',generatedAt:0,verifiedAt:1,verifiedBy:'Vocab Master'},options:[
      {id:'a',text:'The continuing lack of skilled workers can largely be attributed to inadequate training opportunities.',correct:true,rationale:'Giữ quan hệ nguyên nhân và mức độ “major/largely”.'},
      {id:'b',text:'Training opportunities have increased because skilled workers are difficult to find.',correct:false,rationale:'Đảo chiều quan hệ nguyên nhân–kết quả.'},
      {id:'c',text:'A shortage of training staff is the only reason that employees leave their jobs.',correct:false,rationale:'Thay đổi vấn đề, thêm “only” và thêm hành vi nghỉ việc.'}
    ]
  }
]);

export const CURATED_READING_PASSAGES=Object.freeze([
  {
    id:'reading-urban-trees',title:'Urban trees and heat',microSkill:'paraphrase/evidence matching',status:'verified',provenance:{status:'verified',promptVersion:'curated-v1',generatedAt:0,verifiedAt:1,verifiedBy:'Vocab Master'},sourceRef:{type:'reading',sourceId:'curated-urban-trees',title:'Original Vocab Master passage'},
    passage:'Cities are often warmer than surrounding rural areas because roads and buildings absorb and retain heat. Planting more trees can reduce this effect in several ways. Their leaves provide shade, while water released through the leaves cools the nearby air. However, simply increasing the number of trees does not guarantee equal benefits. Neighbourhoods with narrow pavements or limited public land may have fewer suitable planting sites. Young trees also require regular watering and maintenance before they provide substantial shade. For this reason, some planners argue that tree-planting targets should be combined with long-term funding and a clear strategy for the hottest districts. Such an approach may be slower than announcing a city-wide target, but it is more likely to produce measurable improvements where residents face the greatest heat exposure.',
    questions:[
      {id:'q1',type:'paraphrase-match',prompt:'Which statement best matches the passage?',evidenceText:'simply increasing the number of trees does not guarantee equal benefits',explanation:'The passage distinguishes the number of trees from fair distribution of benefits.',options:[
        {id:'a',text:'A larger urban tree population will automatically cool every neighbourhood equally.',correct:false,rationale:'Contradicts “does not guarantee equal benefits”.'},
        {id:'b',text:'Tree numbers alone are insufficient to ensure that all areas benefit to the same degree.',correct:true,rationale:'Accurately paraphrases both “simply increasing” and “does not guarantee equal benefits”.'},
        {id:'c',text:'Trees are ineffective in neighbourhoods with narrow pavements.',correct:false,rationale:'The passage says planting sites may be fewer, not that trees are ineffective.'}
      ]},
      {id:'q2',type:'evidence-match',prompt:'Why does the writer favour long-term funding?',evidenceText:'Young trees also require regular watering and maintenance before they provide substantial shade.',explanation:'Funding is needed because benefits depend on maintenance during the period before trees mature.',options:[
        {id:'a',text:'To pay residents to move out of the hottest districts.',correct:false,rationale:'No relocation programme is mentioned.'},
        {id:'b',text:'To support the maintenance needed before young trees deliver major cooling benefits.',correct:true,rationale:'Directly follows from the evidence sentence.'},
        {id:'c',text:'To replace all roads and buildings with public land.',correct:false,rationale:'The passage does not propose replacing built infrastructure.'}
      ]}
    ]
  }
]);
