import assert from 'node:assert/strict';
import test from 'node:test';

const findingPrototypeKeys=Object.freeze([
  'qar:r1','qar:r2','qar:r3','qar:l1','qar:l2','qar:l3','qar:w1','qar:w2','qar:s1','qar:s2',
  'questionId','optionId','state','frozenAssessments'
]);

function descriptorSnapshot(target,key){
  const descriptor=Object.getOwnPropertyDescriptor(target,key);
  if(!descriptor)return null;
  return{
    configurable:descriptor.configurable,
    enumerable:descriptor.enumerable,
    writable:descriptor.writable,
    value:descriptor.value,
    get:descriptor.get,
    set:descriptor.set
  };
}

function sameDescriptor(left,right){
  if(left===null||right===null)return left===right;
  return left.configurable===right.configurable
    &&left.enumerable===right.enumerable
    &&left.writable===right.writable
    &&left.value===right.value
    &&left.get===right.get
    &&left.set===right.set;
}

test('S15-F001 production imports preserve ambient JavaScript semantics and Object.prototype descriptors',async()=>{
  const before={
    objectKeys:Object.keys,
    hasOwnProperty:Object.prototype.hasOwnProperty,
    mapGet:Map.prototype.get,
    descriptors:Object.fromEntries(findingPrototypeKeys.map(key=>[key,descriptorSnapshot(Object.prototype,key)]))
  };

  const targeted=await import('../src/targeted-diagnostic.js?stage15-f001');
  const ielts=await import('../src/ielts-domain.js?stage15-f001');

  assert.equal(typeof targeted.createTargetedDiagnosticAdapter,'function','Targeted Diagnostic production module must import normally.');
  assert.equal(ielts.parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ').valid,true,'IELTS domain production use must remain healthy.');

  const afterDescriptors=Object.fromEntries(findingPrototypeKeys.map(key=>[key,descriptorSnapshot(Object.prototype,key)]));
  const actual={
    objectKeysIdentity:Object.keys===before.objectKeys,
    hasOwnPropertyIdentity:Object.prototype.hasOwnProperty===before.hasOwnProperty,
    mapGetIdentity:Map.prototype.get===before.mapGet,
    prototypeDescriptorsPreserved:findingPrototypeKeys.every(key=>sameDescriptor(afterDescriptors[key],before.descriptors[key])),
    noFindingPrototypeProperties:findingPrototypeKeys.every(key=>afterDescriptors[key]===before.descriptors[key])
  };

  assert.deepEqual(actual,{
    objectKeysIdentity:true,
    hasOwnPropertyIdentity:true,
    mapGetIdentity:true,
    prototypeDescriptorsPreserved:true,
    noFindingPrototypeProperties:true
  });
});
