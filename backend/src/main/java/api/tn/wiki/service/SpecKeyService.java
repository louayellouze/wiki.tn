package api.tn.wiki.service;

import api.tn.wiki.dto.response.SpecKeyResponse;
import api.tn.wiki.entity.SpecKey;
import api.tn.wiki.repository.SpecKeyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpecKeyService {

    private final SpecKeyRepository specKeyRepository;

    public SpecKeyService(SpecKeyRepository specKeyRepository) {
        this.specKeyRepository = specKeyRepository;
    }

    public List<SpecKeyResponse> getAllSpecKeys() {
        return specKeyRepository.findAll().stream()
                .map(key -> new SpecKeyResponse(key.getId(), key.getName(), key.getType()))
                .collect(Collectors.toList());
    }

    public SpecKeyResponse createSpecKey(String name, String type) {
        if (specKeyRepository.existsByName(name)) {
            throw new RuntimeException("SpecKey with name '" + name + "' already exists");
        }

        SpecKey specKey = new SpecKey();
        specKey.setName(name);
        specKey.setType(type);
        
        SpecKey saved = specKeyRepository.save(specKey);
        return new SpecKeyResponse(saved.getId(), saved.getName(), saved.getType());
    }

    public void deleteSpecKey(Integer id) {
        if (!specKeyRepository.existsById(id)) {
            throw new RuntimeException("SpecKey not found with id: " + id);
        }
        specKeyRepository.deleteById(id);
    }
}
